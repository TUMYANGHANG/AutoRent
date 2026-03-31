import os
import re
import requests
from typing import Any, Text, Dict, List, Optional

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

AUTORENT_API = os.getenv("AUTORENT_API_URL", "http://localhost:5002/api")
REQUEST_TIMEOUT = 10

UUID_PATTERN = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")


def _get_token(tracker: Tracker) -> Optional[str]:
    metadata = tracker.latest_message.get("metadata") or {}
    return metadata.get("token") or metadata.get("auth_token")


def _extract_booking_id(tracker: Tracker) -> Optional[str]:
    """Extract booking ID from slot or by regex from user message text."""
    slot_val = tracker.get_slot("booking_id")
    if slot_val:
        return slot_val
    text = tracker.latest_message.get("text", "")
    match = UUID_PATTERN.search(text)
    return match.group(0) if match else None


def _api_get(path: str, token: Optional[str] = None, params: dict = None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return requests.get(
        f"{AUTORENT_API}{path}",
        headers=headers,
        params=params or {},
        timeout=REQUEST_TIMEOUT,
    )


def _api_patch(path: str, token: str, json_body: dict = None):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return requests.patch(
        f"{AUTORENT_API}{path}",
        headers=headers,
        json=json_body,
        timeout=REQUEST_TIMEOUT,
    )


NO_AUTH_MSG = (
    "It looks like you're not logged in. To access your bookings and perform "
    "actions, please **log in** to your AutoRent account first, then come back "
    "to the chat.\n\nIf you're having trouble logging in, type **login issue** "
    "and I'll help."
)

API_DOWN_MSG = (
    "I couldn't connect to the AutoRent service right now. "
    "Please try again in a moment or use the website directly."
)


# ---------------------------------------------------------------------------
# 1. action_check_availability  –  GET /api/vehicles/browse  (public)
# ---------------------------------------------------------------------------
class ActionCheckAvailability(Action):
    def name(self) -> Text:
        return "action_check_availability"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        vehicle_type = tracker.get_slot("vehicle_type")
        location = tracker.get_slot("location")

        try:
            resp = _api_get("/vehicles/browse")
            if resp.status_code == 200:
                vehicles = resp.json().get("data", [])

                if vehicle_type:
                    vt = vehicle_type.lower()
                    vehicles = [
                        v
                        for v in vehicles
                        if (v.get("vehicleType") or "").lower() == vt
                    ]

                if not vehicles:
                    msg = "I couldn't find any available vehicles"
                    if vehicle_type:
                        msg += f" of type **{vehicle_type}**"
                    if location:
                        msg += f" in **{location}**"
                    msg += (
                        " right now. You can try browsing the **Vehicle Listings** "
                        "page for the latest availability."
                    )
                    dispatcher.utter_message(text=msg)
                else:
                    top = vehicles[:5]
                    msg = "Here are some available vehicles"
                    if vehicle_type:
                        msg += f" ({vehicle_type})"
                    if location:
                        msg += f" near {location}"
                    msg += ":\n\n"

                    for v in top:
                        line = f"- **{v['brand']} {v['model']}**"
                        if v.get("vehicleType"):
                            line += f" ({v['vehicleType']})"
                        line += f" — Rs. {v['pricePerDay']}/day"
                        if v.get("averageRating"):
                            line += f" | Rating: {float(v['averageRating']):.1f}/5"
                        msg += line + "\n"

                    remaining = len(vehicles) - 5
                    if remaining > 0:
                        msg += f"\n...and **{remaining} more** available."
                    msg += (
                        "\n\nVisit the **Vehicle Listings** page to see full details "
                        "and book your preferred vehicle."
                    )
                    dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text="I'm having trouble fetching vehicle data right now. "
                    "Please try the **Vehicle Listings** page directly."
                )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return [SlotSet("vehicle_type", None), SlotSet("location", None)]


# ---------------------------------------------------------------------------
# 2. action_fetch_vehicle_options  –  GET /api/vehicles/browse  (public)
# ---------------------------------------------------------------------------
class ActionFetchVehicleOptions(Action):
    def name(self) -> Text:
        return "action_fetch_vehicle_options"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        try:
            resp = _api_get("/vehicles/browse")
            if resp.status_code == 200:
                vehicles = resp.json().get("data", [])
                type_counts: Dict[str, int] = {}
                type_price_min: Dict[str, float] = {}

                for v in vehicles:
                    vt = v.get("vehicleType") or "Other"
                    type_counts[vt] = type_counts.get(vt, 0) + 1
                    price = float(v.get("pricePerDay", 0))
                    if vt not in type_price_min or price < type_price_min[vt]:
                        type_price_min[vt] = price

                if not type_counts:
                    dispatcher.utter_message(
                        text="There are no vehicles listed on the platform right now. "
                        "Please check back later or visit the **Vehicle Listings** page."
                    )
                else:
                    msg = (
                        "Here are the vehicle categories currently available "
                        "on AutoRent:\n\n"
                    )
                    for vt, count in sorted(type_counts.items()):
                        msg += (
                            f"- **{vt}** — {count} available, "
                            f"starting from Rs. {type_price_min[vt]:,.0f}/day\n"
                        )
                    msg += (
                        "\nYou can browse all vehicles on the **Vehicle Listings** "
                        "page. Would you like to check availability for a specific "
                        "type, or know about pricing?"
                    )
                    dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text="I'm having trouble fetching vehicle data right now. "
                    "Please visit the **Vehicle Listings** page directly."
                )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return []


# ---------------------------------------------------------------------------
# 3. action_fetch_price_estimate  –  GET /api/vehicles/browse  (public)
# ---------------------------------------------------------------------------
class ActionFetchPriceEstimate(Action):
    def name(self) -> Text:
        return "action_fetch_price_estimate"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        vehicle_type = tracker.get_slot("vehicle_type")

        try:
            resp = _api_get("/vehicles/browse")
            if resp.status_code == 200:
                vehicles = resp.json().get("data", [])

                if vehicle_type:
                    vt = vehicle_type.lower()
                    vehicles = [
                        v
                        for v in vehicles
                        if (v.get("vehicleType") or "").lower() == vt
                    ]

                if not vehicles:
                    msg = "I couldn't find pricing info"
                    if vehicle_type:
                        msg += f" for **{vehicle_type}** vehicles"
                    msg += (
                        " right now. Please check the **Vehicle Listings** page "
                        "for up-to-date prices."
                    )
                    dispatcher.utter_message(text=msg)
                else:
                    prices = [float(v["pricePerDay"]) for v in vehicles]
                    min_p, max_p, avg_p = min(prices), max(prices), sum(prices) / len(prices)

                    if vehicle_type:
                        msg = f"Pricing for **{vehicle_type}** vehicles on AutoRent:\n\n"
                    else:
                        msg = "Current rental pricing on AutoRent:\n\n"

                    msg += f"- **Lowest:** Rs. {min_p:,.0f}/day\n"
                    msg += f"- **Average:** Rs. {avg_p:,.0f}/day\n"
                    msg += f"- **Highest:** Rs. {max_p:,.0f}/day\n"
                    msg += f"\nBased on **{len(vehicles)}** available vehicles."

                    if not vehicle_type:
                        type_ranges: Dict[str, list] = {}
                        for v in resp.json().get("data", []):
                            vt_name = v.get("vehicleType") or "Other"
                            type_ranges.setdefault(vt_name, []).append(
                                float(v["pricePerDay"])
                            )
                        msg += " Breakdown by type:\n\n"
                        for vt_name, tp in sorted(type_ranges.items()):
                            msg += (
                                f"- **{vt_name}:** Rs. {min(tp):,.0f} – "
                                f"{max(tp):,.0f}/day\n"
                            )

                    msg += (
                        "\nExact prices vary by vehicle, duration, and owner terms. "
                        "Visit **Vehicle Listings** for specific rates."
                    )
                    dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text="I'm having trouble fetching pricing data right now. "
                    "Please check the **Vehicle Listings** page."
                )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return [SlotSet("vehicle_type", None)]


# ---------------------------------------------------------------------------
# 4. action_fetch_booking_status  –  GET /api/bookings  (auth required)
# ---------------------------------------------------------------------------
class ActionFetchBookingStatus(Action):
    def name(self) -> Text:
        return "action_fetch_booking_status"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        token = _get_token(tracker)
        booking_id = _extract_booking_id(tracker)

        if not token:
            dispatcher.utter_message(text=NO_AUTH_MSG)
            return [SlotSet("booking_id", None)]

        try:
            if booking_id:
                resp = _api_get(f"/bookings/{booking_id}", token=token)
                if resp.status_code == 200:
                    b = resp.json().get("data", {})
                    vehicle = b.get("vehicle") or {}
                    payment = b.get("payment") or {}
                    status = (b.get("status") or "").replace("_", " ").title()

                    msg = "**Booking Details**\n\n"
                    msg += f"- **Vehicle:** {vehicle.get('brand', '')} {vehicle.get('model', '')}\n"
                    msg += f"- **Status:** {status}\n"
                    msg += f"- **Dates:** {b.get('startDate', 'N/A')} to {b.get('returnDate', 'N/A')}\n"
                    msg += f"- **Pickup:** {b.get('pickupPlace', 'N/A')}\n"
                    if b.get("dropoffPlace"):
                        msg += f"- **Drop-off:** {b['dropoffPlace']}\n"
                    if payment:
                        pay_status = (payment.get("status") or "").title()
                        msg += f"- **Payment:** Rs. {payment.get('amount', 'N/A')} ({pay_status})\n"
                    msg += "\nIs there anything else you'd like to know?"
                    dispatcher.utter_message(text=msg)
                elif resp.status_code == 404:
                    dispatcher.utter_message(
                        text=f"I couldn't find a booking with ID **{booking_id}**. "
                        "Please double-check the ID and try again, or say "
                        "**booking status** to see all your bookings."
                    )
                else:
                    dispatcher.utter_message(
                        text="I had trouble fetching that booking. Please try again "
                        "or check your **My Bookings** page."
                    )
            else:
                resp = _api_get("/bookings", token=token)
                if resp.status_code == 200:
                    bookings = resp.json().get("data", [])
                    if not bookings:
                        dispatcher.utter_message(
                            text="You don't have any bookings yet. Would you like to "
                            "browse available vehicles and make a booking?"
                        )
                    else:
                        msg = "Here are your bookings:\n\n"
                        for b in bookings[:10]:
                            vehicle = b.get("vehicle") or {}
                            status = (b.get("status") or "").replace("_", " ").title()
                            short_id = b["id"][:8]
                            msg += (
                                f"- **#{short_id}...** — "
                                f"{vehicle.get('brand', '')} {vehicle.get('model', '')} "
                                f"| {status} | {b.get('startDate', '')} to "
                                f"{b.get('returnDate', '')}\n"
                            )
                        if len(bookings) > 10:
                            msg += f"\n...and {len(bookings) - 10} more.\n"
                        msg += (
                            "\nTo see full details, say **status of booking <ID>**. "
                            "You can find complete booking IDs on your **My Bookings** page."
                        )
                        dispatcher.utter_message(text=msg)
                else:
                    dispatcher.utter_message(
                        text="I had trouble fetching your bookings. "
                        "Please try the **My Bookings** page directly."
                    )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return [SlotSet("booking_id", None), SlotSet("pending_action", None)]


# ---------------------------------------------------------------------------
# 5. action_cancel_booking  –  PATCH /api/bookings/:id/cancel  (auth)
# ---------------------------------------------------------------------------
class ActionCancelBooking(Action):
    def name(self) -> Text:
        return "action_cancel_booking"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        token = _get_token(tracker)
        booking_id = _extract_booking_id(tracker)

        if not token:
            dispatcher.utter_message(text=NO_AUTH_MSG)
            return [SlotSet("booking_id", None)]

        try:
            if booking_id:
                resp = _api_patch(f"/bookings/{booking_id}/cancel", token=token)
                if resp.status_code == 200:
                    dispatcher.utter_message(
                        text=f"Your booking **#{booking_id[:8]}...** has been "
                        "**cancelled** successfully.\n\nPlease check the refund "
                        "policy for any applicable refunds. Would you like to know "
                        "about the **refund policy**?"
                    )
                elif resp.status_code == 400:
                    err = resp.json().get("message", "This booking cannot be cancelled.")
                    dispatcher.utter_message(
                        text=f"I couldn't cancel that booking: {err}\n\nOnly bookings "
                        "with **Pending** or **Confirmed** status can be cancelled."
                    )
                elif resp.status_code == 404:
                    dispatcher.utter_message(
                        text=f"I couldn't find a booking with ID **{booking_id}**. "
                        "Please double-check the ID and try again."
                    )
                else:
                    dispatcher.utter_message(
                        text="Something went wrong while cancelling. Please try from "
                        "the **My Bookings** page or contact support."
                    )
                return [SlotSet("booking_id", None), SlotSet("pending_action", None)]
            else:
                resp = _api_get("/bookings", token=token)
                if resp.status_code == 200:
                    bookings = resp.json().get("data", [])
                    cancellable = [
                        b
                        for b in bookings
                        if b.get("status") in ("pending", "confirmed")
                    ]
                    if not cancellable:
                        dispatcher.utter_message(
                            text="You don't have any bookings that can be cancelled. "
                            "Only **Pending** or **Confirmed** bookings are eligible "
                            "for cancellation."
                        )
                        return [SlotSet("pending_action", None)]
                    else:
                        msg = "Here are your bookings that can be cancelled:\n\n"
                        for b in cancellable[:10]:
                            vehicle = b.get("vehicle") or {}
                            status = (b.get("status") or "").title()
                            msg += (
                                f"- **{b['id']}** — "
                                f"{vehicle.get('brand', '')} {vehicle.get('model', '')} "
                                f"| {status} | {b.get('startDate', '')} to "
                                f"{b.get('returnDate', '')}\n"
                            )
                        msg += (
                            "\nPlease reply with the **booking ID** you'd like to "
                            "cancel (copy the full ID from above)."
                        )
                        dispatcher.utter_message(text=msg)
                        return [SlotSet("pending_action", "cancel_booking")]
                else:
                    dispatcher.utter_message(
                        text="I had trouble fetching your bookings. "
                        "Please try the **My Bookings** page directly."
                    )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return [SlotSet("booking_id", None), SlotSet("pending_action", None)]


# ---------------------------------------------------------------------------
# 6. action_handle_pending_action  –  dispatches based on pending_action slot
# ---------------------------------------------------------------------------
class ActionHandlePendingAction(Action):
    """Routes a booking-ID reply to the right follow-up action."""

    def name(self) -> Text:
        return "action_handle_pending_action"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        token = _get_token(tracker)
        booking_id = _extract_booking_id(tracker)
        pending = tracker.get_slot("pending_action")

        if not token:
            dispatcher.utter_message(text=NO_AUTH_MSG)
            return [SlotSet("pending_action", None), SlotSet("booking_id", None)]

        if not booking_id:
            dispatcher.utter_message(
                text="I didn't catch the booking ID. Could you please paste the "
                "full booking ID? You can find it on your **My Bookings** page."
            )
            return []

        try:
            if pending == "cancel_booking":
                resp = _api_patch(f"/bookings/{booking_id}/cancel", token=token)
                if resp.status_code == 200:
                    dispatcher.utter_message(
                        text=f"Your booking **#{booking_id[:8]}...** has been "
                        "**cancelled** successfully.\n\nWould you like to know "
                        "about the **refund policy**?"
                    )
                elif resp.status_code == 400:
                    err = resp.json().get("message", "This booking cannot be cancelled.")
                    dispatcher.utter_message(text=f"I couldn't cancel that booking: {err}")
                elif resp.status_code == 404:
                    dispatcher.utter_message(
                        text=f"I couldn't find booking **{booking_id}**. "
                        "Please check the ID and try again."
                    )
                else:
                    dispatcher.utter_message(
                        text="Something went wrong. Please try from the "
                        "**My Bookings** page."
                    )
            else:
                resp = _api_get(f"/bookings/{booking_id}", token=token)
                if resp.status_code == 200:
                    b = resp.json().get("data", {})
                    vehicle = b.get("vehicle") or {}
                    payment = b.get("payment") or {}
                    status = (b.get("status") or "").replace("_", " ").title()

                    msg = f"**Booking #{booking_id[:8]}...**\n\n"
                    msg += f"- **Vehicle:** {vehicle.get('brand', '')} {vehicle.get('model', '')}\n"
                    msg += f"- **Status:** {status}\n"
                    msg += f"- **Dates:** {b.get('startDate', 'N/A')} to {b.get('returnDate', 'N/A')}\n"
                    msg += f"- **Pickup:** {b.get('pickupPlace', 'N/A')}\n"
                    if payment:
                        pay_status = (payment.get("status") or "").title()
                        msg += f"- **Payment:** Rs. {payment.get('amount', 'N/A')} ({pay_status})\n"
                    msg += "\nIs there anything else I can help with?"
                    dispatcher.utter_message(text=msg)
                elif resp.status_code == 404:
                    dispatcher.utter_message(
                        text=f"I couldn't find booking **{booking_id}**. "
                        "Please check the ID."
                    )
                else:
                    dispatcher.utter_message(
                        text="Something went wrong. Please try the **My Bookings** page."
                    )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return [SlotSet("booking_id", None), SlotSet("pending_action", None)]


# ---------------------------------------------------------------------------
# 7. action_list_booking_requests  –  GET /api/booking-requests  (auth)
# ---------------------------------------------------------------------------
class ActionListBookingRequests(Action):
    def name(self) -> Text:
        return "action_list_booking_requests"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        token = _get_token(tracker)

        if not token:
            dispatcher.utter_message(text=NO_AUTH_MSG)
            return []

        try:
            resp = _api_get("/booking-requests", token=token)
            if resp.status_code == 200:
                requests_list = resp.json().get("data", [])
                if not requests_list:
                    dispatcher.utter_message(
                        text="You don't have any booking requests. Would you like "
                        "to browse available vehicles?"
                    )
                else:
                    msg = "Here are your booking requests:\n\n"
                    for r in requests_list[:10]:
                        vehicle = r.get("vehicle") or {}
                        status = (r.get("status") or "").title()
                        msg += (
                            f"- **#{r['id'][:8]}...** — "
                            f"{vehicle.get('brand', '')} {vehicle.get('model', '')} "
                            f"| {status} | {r.get('startDate', '')} to "
                            f"{r.get('returnDate', '')}\n"
                        )
                    if len(requests_list) > 10:
                        msg += f"\n...and {len(requests_list) - 10} more.\n"
                    msg += (
                        "\nPending requests can be cancelled. Check your "
                        "**My Bookings** page for full details."
                    )
                    dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(
                    text="I had trouble fetching your booking requests. "
                    "Please check the **My Bookings** page."
                )
        except requests.exceptions.RequestException:
            dispatcher.utter_message(text=API_DOWN_MSG)

        return []

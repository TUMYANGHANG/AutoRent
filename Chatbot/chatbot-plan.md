## AutoRent Chatbot – Rasa Implementation Plan

### 1. Scope and Objectives

- **Primary goals**
  - Support renters and owners with booking assistance, FAQs, and general navigation for the AutoRent platform.
  - Provide 24/7 conversational support aligned with SRS (FR-4.1) and your task list in `dos.txt`.
  - Respect all constraints from the Non-Do’s document (no misleading, vague, or privacy-violating behavior).
- **Phase strategy**
  - **Phase 1**: Informational chatbot with guided conversations (no or minimal backend integration).
  - **Phase 2**: Fully integrated transactional assistant (availability checks, booking creation, modification, cancellation, status queries via backend APIs).

### 2. Conversational Flows

- **Booking Assistance**
  - New booking
    - Greet user → identify role (renter) → ask for pickup location and dates → ask for vehicle category (car/bike/jeep, etc.) → collect preferences (budget, transmission, fuel type) → show available options or generic guidance → explain rental terms and insurance/fuel policies → confirm interest → send booking request to backend or guide user to booking page → summarize booking details and next steps.
  - Modify / cancel booking
    - Ask for booking identifier (e.g., booking ID, registered phone/email, or logged-in context from frontend) → confirm the specific booking → ask whether to modify or cancel → gather new details (dates, vehicle type, etc.) if modifying → call backend or instruct on how to proceed → confirm change/cancellation and summarize.
  - Booking status and notifications
    - Ask for booking ID or context → retrieve or simulate status (pending, confirmed, canceled) → explain status clearly and suggest next steps → if status is uncertain or backend unavailable, provide safe, non-misleading fallback and suggest human support.

- **FAQs (Frequently Asked Questions)**
  - Topics:
    - Booking process (how to book, required steps).
    - Payments (supported methods: eSewa, Khalti, Stripe, refunds, payment flow).
    - Policies (refund, cancellation, deposits, rental conditions).
    - Account and login (create account, login issues, password reset, profile update).
    - Documents and verification (how to upload ID and license, verification steps).
    - Security and privacy (data protection, use of personal info).
    - Vehicle and garage locator (how to use map features and find nearby garages).
    - Pricing model (hourly vs daily, discounts, approximate estimates).
  - Flow pattern:
    - User may ask direct FAQ (e.g., “How do I book a car?”) or choose from a menu of topics → chatbot answers concisely, with optional follow-up questions or links → user can ask additional follow-up questions or switch topics.

- **General Inquiries**
  - Navigation
    - Guide users to screens: vehicle listings, booking history, profile, verification, support/contact, garage locator.
  - Troubleshooting and downtime
    - Login issues, payment failures, system maintenance → offer clear steps, avoid technical jargon, and provide alternatives (e.g., contact support).
  - Support and live chat
    - When needed, instruct users how to contact human support or open a ticket, following escalation rules.

- **Error and Fallback Flows**
  - Clarify unclear questions instead of replying with generic “I don’t understand”.
  - Provide short, empathetic fallbacks with options (e.g., rephrase, choose a topic, or contact support).
  - Handle missing or failing backend responses gracefully, never exposing raw errors.

### 3. Rasa Design (Intents, Entities, Slots, Stories/Rules)

- **Intents (conceptual)**
  - Booking: `check_availability`, `request_vehicle_options`, `ask_price_estimate`, `confirm_booking`, `modify_booking`, `cancel_booking`, `ask_booking_status`.
  - FAQs: `ask_how_to_book`, `ask_payment_methods`, `ask_refund_policy`, `ask_rental_terms`, `ask_deposit_info`, `ask_verification_process`, `ask_how_to_upload_documents`, `ask_security_privacy`, `ask_pricing_model`, `ask_locator_usage`.
  - General: `greet`, `goodbye`, `help`, `navigate_feature`, `account_help`, `login_issue`, `change_password`, `update_profile`, `contact_support`, `report_issue`.
  - Meta/small talk: `out_of_scope`, `bot_challenge`, `thank_you`, `affirm`, `deny`, `restart`, `repeat`.

- **Entities and Slots (conceptual)**
  - Booking details: `location`, `start_date`, `end_date`, `vehicle_type` (car/bike/jeep), `budget_range`, `transmission_type`, `fuel_type`.
  - Identification: `booking_id`, possibly `phone_number` or `email` (used minimally and explained clearly).
  - Context: `intent_topic` (booking vs FAQ vs navigation), `escalation_needed` (boolean), `user_role` (renter/owner/admin if known from frontend).
  - Use slots to drive forms (e.g., booking form) and to control dialogue flow.

- **Stories and Rules**
  - Write clear “happy path” stories for:
    - Successful new booking flow.
    - Checking availability and suggesting vehicle options.
    - Modifying and canceling bookings.
    - Each major FAQ topic (one or more example conversations).
  - Add rules for:
    - Greetings, goodbye, simple FAQs with static answers.
    - Slot-filling and asking for missing required information.
    - Fallback and escalation behavior.
    - Handling out-of-scope or repeated misunderstandings.

### 4. Safety, Non-Do’s, and Conversation Style

- **Respect Non-Do’s list**
  - Avoid vague, incomplete, or contradictory information about availability, prices, or terms.
  - Never confirm unavailable vehicles or promise guaranteed lowest prices or always-available services.
  - Do not request sensitive data (passwords, bank details) and explain clearly when any identifier is needed.
  - Avoid off-topic responses and irrelevant long paragraphs.

- **Tone and Language**
  - Use simple, clear, non-technical language.
  - Be concise but friendly; avoid overly long messages unless necessary.
  - Show empathy when users are confused, frustrated, or report issues (brief apologies and acknowledgment).

- **Privacy and Data Handling (at conversation level)**
  - Request only the minimum personal data needed to complete an action (e.g., booking ID).
  - Explain why the data is requested and how it’s used.
  - Avoid storing or exposing sensitive user data through bot responses.

- **Escalation Rules**
  - Escalate to human support when:
    - The chatbot fails to understand the user after multiple clarification attempts.
    - Backend systems are unavailable or give inconsistent data.
    - The issue is complex or high-risk (payment problems, suspected fraud, legal questions).
  - Provide clear instructions on how to reach support (e.g., “Contact support from the Help section” or via provided contact information).

### 5. Rasa Project Structure and Configuration

- **Use existing template structure**
  - `domain.yml` (or equivalent): define intents, entities, slots, responses, forms, and actions that correspond to the flows above.
  - `data/nlu.yml`: training examples for each intent, covering various user phrasings from SRS and task list.
  - `data/stories.yml` and `data/rules.yml`: conversation flows and deterministic rules.
  - `actions/`: custom Python actions to call backend APIs (availability, booking, cancellation, status, policy retrieval).

- **Channels and Credentials**
  - Keep `rest` channel active (already configured in `credentials.yml`) for integration with MERN backend.
  - Optionally add `socketio` or webchat later for direct integration with React frontend.

- **NLU Pipeline and Policies (conceptual)**
  - Use a modern Rasa NLU pipeline suitable for multi-intent FAQs + transactional flows.
  - Include a response selector (for FAQ answers) and appropriate dialogue policies (RulePolicy, TEDPolicy, etc.).

### 6. Integration with MERN Platform

- **Backend Integration**
  - Design REST endpoints on Node/Express backend for:
    - Checking real-time vehicle availability based on location, dates, and filters.
    - Fetching available vehicles and estimated prices.
    - Creating, modifying, and canceling bookings.
    - Getting booking status and history.
    - Retrieving up-to-date policy/FAQ content.
  - Standardize responses and error messages so Rasa actions can handle success, failure, and partial data consistently.

- **Frontend Integration**
  - Embed a chat widget in the React frontend (e.g., floating assistant).
  - Decide where chatbot is available (home page, booking page, support page).
  - Pass context (e.g., logged-in user role or current page) to backend so Rasa can personalize assistance without exposing sensitive data.

### 7. Testing and Evaluation

- **Conversation Scenarios**
  - Derive test cases from:
    - Booking tasks (Task 1–8 in `dos.txt` under Booking Assistance).
    - FAQ tasks (Task 1–9).
    - General inquiries (Task 1–8).
  - Include edge cases: unknown locations, unavailable vehicles, invalid booking IDs, failed payments, repeated misunderstandings.

- **NLU and Dialogue Testing**
  - Evaluate intent classification and entity extraction with Rasa test tools.
  - Add conversation tests for critical flows (booking, modification, cancellation, payment FAQs).
  - Iterate based on logs and real user data.

- **UX Review**
  - Check that responses are:
    - Short and easy to understand.
    - On-topic and aligned with user intent.
    - Empathetic, especially during errors or escalations.

### 8. Documentation and SRS Alignment

- **Chatbot-Specific Specification**
  - Maintain a brief document (or section) that:
    - Maps SRS functional requirements (especially FR-4.1 and related items) to chatbot intents, stories, and actions.
    - Lists all supported user journeys for booking, FAQs, and platform navigation.
    - Documents limitations and known non-supported scenarios.

- **Change Management**
  - When the AutoRent platform adds or changes features (new payment methods, updated policies, etc.):
    - Update chatbot FAQs, stories, and/or backend actions.
    - Re-train the model and, if needed, update conversation tests to reflect the new behavior.


const TermsOfService = () => {
  return (
    <section className="min-h-screen bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Terms of <span className="text-orange-500">Service</span>
          </h1>
          <p className="text-lg text-gray-400">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white">
          {/* Introduction */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <p className="leading-relaxed text-gray-300">
              Welcome to AutoRent. These Terms of Service ("Terms") govern your
              access to and use of our vehicle rental platform, website, and
              services ("Service") provided by AutoRent ("we," "our," or "us").
              By accessing or using our Service, you agree to be bound by these
              Terms. If you disagree with any part of these Terms, you may not
              access the Service.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              1. Acceptance of Terms
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                By creating an account, booking a vehicle, or using any of our
                services, you acknowledge that you have read, understood, and
                agree to be bound by these Terms and our Privacy Policy. If you
                do not agree to these Terms, you must not use our Service.
              </p>
              <p className="leading-relaxed">
                You must be at least 18 years old and have a valid driver's
                license to use our Service. By using our Service, you represent
                and warrant that you meet these requirements.
              </p>
            </div>
          </div>

          {/* Account Registration */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              2. Account Registration
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                To access certain features of our Service, you must register for
                an account. When registering, you agree to:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Provide accurate, current, and complete information about
                  yourself
                </li>
                <li>
                  Maintain and promptly update your account information to keep
                  it accurate
                </li>
                <li>
                  Maintain the security of your account credentials and password
                </li>
                <li>
                  Accept responsibility for all activities that occur under your
                  account
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your account if any
                information provided is inaccurate, incomplete, or violates
                these Terms.
              </p>
            </div>
          </div>

          {/* Vehicle Rental Terms */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              3. Vehicle Rental Terms
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.1 Booking and Reservation
                </h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    All bookings are subject to vehicle availability and our
                    approval
                  </li>
                  <li>
                    You must provide valid identification, driver's license, and
                    payment information at the time of booking
                  </li>
                  <li>
                    Booking confirmations will be sent to your registered email
                    address
                  </li>
                  <li>
                    We reserve the right to cancel or modify bookings due to
                    circumstances beyond our control
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.2 Rental Period and Extensions
                </h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    The rental period begins at the agreed pickup time and ends
                    at the agreed drop-off time
                  </li>
                  <li>
                    Late returns may incur additional fees as specified in your
                    rental agreement
                  </li>
                  <li>Extensions must be requested and approved in advance</li>
                  <li>
                    Early returns do not entitle you to a refund for unused
                    rental days
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.3 Vehicle Use and Restrictions
                </h3>
                <p className="mb-2 leading-relaxed">
                  You agree to use the vehicle only for personal or business
                  purposes and in accordance with applicable laws. You agree NOT
                  to:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Use the vehicle for any illegal purpose</li>
                  <li>
                    Allow unauthorized drivers (only drivers listed on the
                    rental agreement may operate the vehicle)
                  </li>
                  <li>Sublet or transfer the vehicle to another person</li>
                  <li>
                    Use the vehicle for commercial passenger transport (taxi,
                    rideshare, etc.)
                  </li>
                  <li>
                    Use the vehicle to tow, push, or transport objects exceeding
                    vehicle capacity
                  </li>
                  <li>Operate the vehicle while under the influence</li>
                  <li>
                    Use the vehicle in areas prohibited by the rental agreement
                    (off-road, unauthorized territories, etc.)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              4. Payment Terms
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  4.1 Rental Fees
                </h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Rental fees are calculated based on the selected vehicle,
                    rental duration, and additional services
                  </li>
                  <li>
                    All prices are displayed in the local currency and are
                    subject to applicable taxes and fees
                  </li>
                  <li>
                    Additional fees may apply for extras (GPS, child seats,
                    additional drivers, etc.)
                  </li>
                  <li>
                    A security deposit may be required and will be held until
                    the vehicle is returned in satisfactory condition
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  4.2 Payment Methods
                </h3>
                <p className="leading-relaxed">
                  We accept payments through various methods including credit
                  cards, debit cards, and digital payment platforms (eSewa,
                  Stripe, Khalti). All payments must be made in advance or at
                  the time of vehicle pickup.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  4.3 Cancellation and Refunds
                </h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Cancellations made 48 hours or more before the pickup time
                    are eligible for a full refund
                  </li>
                  <li>
                    Cancellations made less than 48 hours before pickup may be
                    subject to cancellation fees
                  </li>
                  <li>
                    No-show or failure to pick up the vehicle at the scheduled
                    time will result in forfeiture of the rental fee
                  </li>
                  <li>
                    Refunds will be processed to the original payment method
                    within 5-10 business days
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Insurance and Liability */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              5. Insurance and Liability
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  5.1 Insurance Coverage
                </h3>
                <p className="leading-relaxed">
                  Basic insurance coverage is included with all rentals. You may
                  choose to purchase additional protection plans for enhanced
                  coverage. All insurance is subject to the terms and conditions
                  of the insurance provider.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  5.2 Your Liability
                </h3>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    You are responsible for any damage to the vehicle during the
                    rental period
                  </li>
                  <li>
                    You are liable for all traffic violations, fines, and
                    penalties incurred during the rental period
                  </li>
                  <li>
                    You must report any accidents or incidents to us immediately
                  </li>
                  <li>
                    Damage costs will be deducted from your security deposit or
                    charged to your payment method
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  5.3 Vehicle Condition
                </h3>
                <p className="leading-relaxed">
                  You must return the vehicle in the same condition as when
                  received, except for normal wear and tear. You will be
                  responsible for any damage beyond normal wear and tear,
                  including but not limited to scratches, dents, interior
                  damage, and mechanical issues caused by misuse.
                </p>
              </div>
            </div>
          </div>

          {/* Prohibited Activities */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              6. Prohibited Activities
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                You agree NOT to engage in any of the following prohibited
                activities:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Violate any applicable local, state, or federal laws or
                  regulations
                </li>
                <li>
                  Infringe upon or violate our intellectual property rights or
                  the rights of others
                </li>
                <li>Harass, abuse, or harm other users or our employees</li>
                <li>Submit false or fraudulent information</li>
                <li>
                  Attempt to gain unauthorized access to our systems or accounts
                </li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>
                  Use automated systems to access the Service without
                  authorization
                </li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              7. Limitation of Liability
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                To the maximum extent permitted by law, AutoRent and its
                affiliates, employees, and agents shall not be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including but not limited to loss of profits, data,
                use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of your account</li>
                <li>Vehicle breakdowns, accidents, or mechanical failures</li>
                <li>Delays, cancellations, or modifications to bookings</li>
                <li>Third-party conduct or content</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                Our total liability to you for all claims arising from or
                related to the Service shall not exceed the total amount you
                paid to us in the 12 months preceding the claim.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              8. Indemnification
            </h2>
            <p className="leading-relaxed text-gray-300">
              You agree to indemnify, defend, and hold harmless AutoRent, its
              affiliates, employees, and agents from and against any and all
              claims, damages, obligations, losses, liabilities, costs, and
              expenses (including attorney's fees) arising from: (a) your use of
              the Service; (b) your violation of these Terms; (c) your violation
              of any third-party rights; or (d) any damage caused by you or your
              use of a rented vehicle.
            </p>
          </div>

          {/* Termination */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              9. Termination
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice, for any reason,
                including but not limited to:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Breach of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Violation of rental agreement terms</li>
                <li>At our sole discretion, for any other reason</li>
              </ul>
              <p className="leading-relaxed">
                Upon termination, your right to use the Service will immediately
                cease. All outstanding fees and charges will remain due and
                payable.
              </p>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              10. Dispute Resolution
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Any disputes arising from or relating to these Terms or the
                Service shall be resolved through good faith negotiation. If a
                resolution cannot be reached, disputes shall be resolved through
                binding arbitration in accordance with the laws of Nepal.
              </p>
              <p className="leading-relaxed">
                You agree to first contact us directly to resolve any dispute
                before initiating arbitration or legal proceedings.
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              11. Changes to Terms
            </h2>
            <p className="leading-relaxed text-gray-300">
              We reserve the right to modify or replace these Terms at any time.
              If the changes are material, we will notify you by email or
              through a notice on our website. Your continued use of the Service
              after any changes constitutes acceptance of the new Terms. We
              encourage you to review these Terms periodically.
            </p>
          </div>

          {/* Governing Law */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              12. Governing Law
            </h2>
            <p className="leading-relaxed text-gray-300">
              These Terms shall be governed by and construed in accordance with
              the laws of Nepal, without regard to its conflict of law
              provisions. Any legal action or proceeding arising under these
              Terms will be brought exclusively in the courts of Nepal.
            </p>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              13. Contact Information
            </h2>
            <div className="space-y-2 text-gray-300">
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong className="text-white">AutoRent</strong>
                </p>
                <p>#025, Dulhari, Itahari</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:legal@autorent.com"
                    className="text-orange-500 transition-colors hover:text-orange-400"
                  >
                    legal@autorent.com
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a
                    href="tel:+9779815045184"
                    className="text-orange-500 transition-colors hover:text-orange-400"
                  >
                    +977 9815045184
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 rounded-lg border border-orange-500/20 bg-orange-500/10 p-6 text-center">
          <p className="text-gray-300">
            By using AutoRent's services, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;

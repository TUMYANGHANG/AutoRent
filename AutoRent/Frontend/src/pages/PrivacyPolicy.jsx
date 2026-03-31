const PrivacyPolicy = () => {
  return (
    <section className="min-h-screen bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Privacy <span className="text-orange-500">Policy</span>
          </h1>
          <p className="text-lg text-gray-400">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white">
          {/* Introduction */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <p className="text-gray-300 leading-relaxed">
              At AutoRent ("we," "our," or "us"), we are committed to protecting
              your privacy and ensuring the security of your personal
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our vehicle
              rental platform, website, and services. By using our services, you
              agree to the collection and use of information in accordance with
              this policy.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  1.1 Personal Information
                </h3>
                <p className="leading-relaxed">
                  When you register for an account, book a vehicle, or use our
                  services, we may collect the following personal information:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1">
                  <li>
                    Full name and contact information (email address, phone
                    number)
                  </li>
                  <li>
                    Date of birth and government-issued identification (driver's
                    license, passport)
                  </li>
                  <li>
                    Billing address and payment information (credit card
                    details, billing history)
                  </li>
                  <li>Vehicle rental history and preferences</li>
                  <li>Profile information and account credentials</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  1.2 Usage Information
                </h3>
                <p className="leading-relaxed">
                  We automatically collect information about how you interact
                  with our platform:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1">
                  <li>
                    Device information (IP address, browser type, operating
                    system)
                  </li>
                  <li>
                    Usage data (pages visited, time spent, click patterns)
                  </li>
                  <li>Location data (when you enable location services)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  1.3 Vehicle and Rental Information
                </h3>
                <p className="leading-relaxed">
                  In connection with vehicle rentals, we collect:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1">
                  <li>Pickup and drop-off locations and times</li>
                  <li>Vehicle preferences and rental specifications</li>
                  <li>Additional driver information (if applicable)</li>
                  <li>Insurance and protection plan selections</li>
                  <li>Incident reports and vehicle condition assessments</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We use the collected information for the following purposes:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-white">Service Delivery:</strong> To
                  process bookings, manage rentals, verify identity, and provide
                  customer support
                </li>
                <li>
                  <strong className="text-white">Communication:</strong> To send
                  booking confirmations, rental updates, promotional offers, and
                  important service notifications
                </li>
                <li>
                  <strong className="text-white">Payment Processing:</strong> To
                  process payments, handle refunds, and prevent fraudulent
                  transactions
                </li>
                <li>
                  <strong className="text-white">Account Management:</strong> To
                  maintain your account, manage preferences, and personalize
                  your experience
                </li>
                <li>
                  <strong className="text-white">Legal Compliance:</strong> To
                  comply with legal obligations, enforce our terms of service,
                  and protect our rights
                </li>
                <li>
                  <strong className="text-white">
                    Analytics and Improvement:
                  </strong>{" "}
                  To analyze usage patterns, improve our services, and develop
                  new features
                </li>
                <li>
                  <strong className="text-white">Marketing:</strong> To send
                  promotional materials (with your consent) and conduct
                  marketing campaigns
                </li>
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              3. Information Sharing and Disclosure
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                We may share your information in the following circumstances:
              </p>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.1 Service Providers
                </h3>
                <p className="leading-relaxed">
                  We may share information with third-party service providers
                  who assist us in operating our platform, including:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1">
                  <li>Payment processors (eSewa, Stripe, Khalti)</li>
                  <li>Vehicle owners and rental partners</li>
                  <li>Insurance providers</li>
                  <li>Customer support services</li>
                  <li>Analytics and data processing services</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.2 Legal Requirements
                </h3>
                <p className="leading-relaxed">
                  We may disclose information when required by law, court order,
                  or governmental authority, or to protect our rights, property,
                  or safety.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.3 Business Transfers
                </h3>
                <p className="leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your
                  information may be transferred to the acquiring entity.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  3.4 With Your Consent
                </h3>
                <p className="leading-relaxed">
                  We may share information with third parties when you
                  explicitly consent to such sharing.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              4. Data Security
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your
                personal information:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Encryption of sensitive data during transmission (SSL/TLS)
                </li>
                <li>Secure storage of personal and payment information</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p className="mt-4 leading-relaxed text-gray-400">
                However, no method of transmission over the internet or
                electronic storage is 100% secure. While we strive to protect
                your information, we cannot guarantee absolute security.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              5. Your Rights and Choices
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-white">Access:</strong> Request access
                  to your personal information
                </li>
                <li>
                  <strong className="text-white">Correction:</strong> Request
                  correction of inaccurate or incomplete information
                </li>
                <li>
                  <strong className="text-white">Deletion:</strong> Request
                  deletion of your personal information (subject to legal
                  requirements)
                </li>
                <li>
                  <strong className="text-white">Opt-Out:</strong> Unsubscribe
                  from marketing communications at any time
                </li>
                <li>
                  <strong className="text-white">Data Portability:</strong>{" "}
                  Request a copy of your data in a portable format
                </li>
                <li>
                  <strong className="text-white">Account Management:</strong>{" "}
                  Update or delete your account through your account settings
                </li>
              </ul>
              <p className="mt-4 leading-relaxed">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:privacy@autorent.com"
                  className="text-orange-500 hover:text-orange-400 transition-colors"
                >
                  privacy@autorent.com
                </a>
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              6. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We use cookies and similar technologies to enhance your
                experience:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-white">Essential Cookies:</strong>{" "}
                  Required for basic site functionality
                </li>
                <li>
                  <strong className="text-white">Analytics Cookies:</strong>{" "}
                  Help us understand how visitors use our site
                </li>
                <li>
                  <strong className="text-white">Preference Cookies:</strong>{" "}
                  Remember your settings and preferences
                </li>
                <li>
                  <strong className="text-white">Marketing Cookies:</strong>{" "}
                  Used to deliver relevant advertisements
                </li>
              </ul>
              <p className="mt-4 leading-relaxed">
                You can control cookies through your browser settings. However,
                disabling cookies may limit certain features of our platform.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              7. Children's Privacy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you believe we have inadvertently collected information from a
              child, please contact us immediately, and we will take steps to
              delete such information.
            </p>
          </div>

          {/* International Transfers */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              8. International Data Transfers
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              different data protection laws. By using our services, you consent
              to the transfer of your information to these countries. We ensure
              appropriate safeguards are in place to protect your information in
              accordance with this Privacy Policy.
            </p>
          </div>

          {/* Changes to Privacy Policy */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of any material changes by posting the new Privacy Policy on this
              page and updating the "Last updated" date. We encourage you to
              review this Privacy Policy periodically for any changes.
            </p>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg bg-gray-900/50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              10. Contact Us
            </h2>
            <div className="space-y-2 text-gray-300">
              <p className="leading-relaxed">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong className="text-white">AutoRent</strong>
                </p>
                <p>#025, Dulhari, Itahari</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:privacy@autorent.com"
                    className="text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    privacy@autorent.com
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a
                    href="tel:+9779815045184"
                    className="text-orange-500 hover:text-orange-400 transition-colors"
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
            By using AutoRent's services, you acknowledge that you have read and
            understood this Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;

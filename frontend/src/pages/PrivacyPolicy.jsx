import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-10 text-center">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-gray-300 leading-8 text-[17px]">

          <p>
            <strong>Last updated:</strong> May 29, 2026
          </p>

          <p>
            This Privacy Policy describes Our policies and procedures on the
            collection, use and disclosure of Your information when You use the
            Service and tells You about Your privacy rights and how the law
            protects You.
          </p>

          <p>
            We use Your Personal Data to provide and improve the Service. By
            using the Service, You agree to the collection and use of
            information in accordance with this Privacy Policy.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Information We Collect
          </h2>

          <ul className="list-disc pl-8 space-y-2">
            <li>Email address</li>
            <li>Usage data</li>
            <li>Browser and device information</li>
            <li>Prompt inputs submitted for AI processing</li>
            <li>Authentication and login information</li>
          </ul>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Email Verification and OTP Authentication
          </h2>

          <p>
            Prompt Forge AI may send one-time passwords (OTP) or verification
            emails to users for authentication, account security, and login
            verification purposes. These emails are used solely for account
            access and security-related functionality.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            AI Processing
          </h2>

          <p>
            Prompt Forge AI uses third-party AI providers including Gemini,
            Groq, and Hugging Face APIs to analyze and optimize prompts.
            Prompt data may be temporarily processed through these services
            solely for prompt enhancement functionality.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Cookies and Local Storage
          </h2>

          <p>
            We use cookies and browser storage technologies to maintain user
            sessions, save preferences, improve user experience, and analyze
            platform performance.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            How We Use Your Information
          </h2>

          <ul className="list-disc pl-8 space-y-2">
            <li>To provide and maintain our services</li>
            <li>To authenticate and secure user accounts</li>
            <li>To improve AI prompt enhancement quality</li>
            <li>To analyze usage trends and platform performance</li>
            <li>To respond to user support requests</li>
          </ul>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Data Security
          </h2>

          <p>
            We implement reasonable technical and organizational safeguards to
            protect user data and maintain service security. However, no method
            of transmission over the Internet is completely secure.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Third-Party Services
          </h2>

          <p>
            Prompt Forge AI may use third-party services including:
          </p>

          <ul className="list-disc pl-8 space-y-2">
            <li>Google Gemini API</li>
            <li>Groq API</li>
            <li>Hugging Face API</li>
            <li>Render</li>
            <li>Vercel</li>
          </ul>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Children's Privacy
          </h2>

          <p>
            Our services are not intended for children under the age of 13.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Changes to This Privacy Policy
          </h2>

          <p>
            We may update this Privacy Policy periodically. Changes become
            effective immediately after being posted on this page.
          </p>

          <h2 className="text-3xl font-semibold text-white pt-6">
            Contact Us
          </h2>

          <p>
            If you have any questions regarding this Privacy Policy, contact:
          </p>

          <p className="text-blue-400 font-medium">
            hivinothini@gmail.com
          </p>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;


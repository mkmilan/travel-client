"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
	const lastUpdated = "May 13, 2025"; // Update this date whenever the policy is changed
	const appName = "Motorhome Mapper";
	const companyName = "Your Company Name"; // Replace with your actual company name or your name if individual
	const contactEmail = "your-email@example.com"; // Replace with your contact email
	const websiteUrl = "https://your-app-url.com"; // Replace with your app's URL

	return (
		<div className="max-w-3xl mx-auto p-4 md:p-8">
			<div className="bg-white p-6 md:p-10 shadow-md border border-gray-200 prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
				<h1>Privacy Policy for {appName}</h1>
				<p>
					<strong>Last Updated:</strong> {lastUpdated}
				</p>

				<p>
					Welcome to {appName}! This Privacy Policy explains how {companyName}
					(referred to as &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
					collects, uses, shares, and protects your personal information when
					you use our mobile application and website (collectively, the
					&quot;Service&quot;). We are committed to protecting your privacy and
					ensuring that your personal data is handled in a safe and responsible
					manner, in compliance with the General Data Protection Regulation
					(GDPR) and other relevant data protection laws.
				</p>

				<h2>1. Information We Collect</h2>
				<p>We may collect the following types of information:</p>
				<ul>
					<li>
						<strong>Personal Identification Information:</strong> Name, email
						address, profile picture, and other information you provide when you
						register for an account or update your profile.
					</li>
					<li>
						<strong>Trip Data:</strong> Information related to your trips,
						including GPS coordinates, routes, locations, dates, photos, notes,
						points of interest, travel mode, and any other data you upload or
						generate while using the Service.
					</li>
					<li>
						<strong>Usage Data:</strong> Information about how you access and
						use the Service, such as your IP address, browser type, device
						information, operating system, pages viewed, features used, and the
						dates and times of your interactions.
					</li>
					<li>
						<strong>Communications:</strong> If you contact us directly, we may
						receive additional information about you such as your name, email
						address, phone number, the contents of the message and/or
						attachments you may send us, and any other information you may
						choose to provide.
					</li>
					<li>
						<strong>Cookies and Similar Technologies:</strong> We use cookies
						and similar tracking technologies to track activity on our Service
						and hold certain information. You can instruct your browser to
						refuse all cookies or to indicate when a cookie is being sent.
						However, if you do not accept cookies, you may not be able to use
						some portions of our Service.
					</li>
				</ul>

				<h2>2. How We Use Your Information</h2>
				<p>
					We use the information we collect for various purposes, including:
				</p>
				<ul>
					<li>To provide, operate, and maintain our Service.</li>
					<li>To improve, personalize, and expand our Service.</li>
					<li>To understand and analyze how you use our Service.</li>
					<li>
						To develop new products, services, features, and functionality.
					</li>
					<li>
						To communicate with you, either directly or through one of our
						partners, including for customer service, to provide you with
						updates and other information relating to the Service, and for
						marketing and promotional purposes (with your consent where
						required).
					</li>
					<li>To process your transactions.</li>
					<li>To find and prevent fraud.</li>
					<li>
						For compliance purposes, including enforcing our Terms of Service.
					</li>
				</ul>

				<h2>3. Legal Basis for Processing Personal Data (GDPR)</h2>
				<p>
					If you are from the European Economic Area (EEA), our legal basis for
					collecting and using the personal information described in this
					Privacy Policy depends on the Personal Data we collect and the
					specific context in which we collect it. We may process your Personal
					Data because:
				</p>
				<ul>
					<li>We need to perform a contract with you.</li>
					<li>You have given us permission to do so.</li>
					<li>
						The processing is in our legitimate interests and it&apos;s not
						overridden by your rights.
					</li>
					<li>For payment processing purposes.</li>
					<li>To comply with the law.</li>
				</ul>

				<h2>4. Sharing Your Information</h2>
				<p>
					We do not sell your personal information. We may share your
					information in the following situations:
				</p>
				<ul>
					<li>
						<strong>With Service Providers:</strong> We may share your personal
						information with third-party service providers to monitor and
						analyze the use of our Service, for payment processing, data storage
						(e.g., cloud hosting), and other services necessary to operate our
						Service. These providers are obligated to protect your data and use
						it only for the purposes we specify.
					</li>
					<li>
						<strong>For Legal Reasons:</strong> We may disclose your information
						if required to do so by law or in response to valid requests by
						public authorities (e.g., a court or a government agency).
					</li>
					<li>
						<strong>Business Transfers:</strong> If we are involved in a merger,
						acquisition, or asset sale, your Personal Data may be transferred.
					</li>
					<li>
						<strong>With Your Consent:</strong> We may disclose your personal
						information for any other purpose with your consent.
					</li>
					<li>
						<strong>Publicly Shared Information:</strong> Any information you
						choose to make public through the Service (e.g., public trips,
						comments) will be accessible to others.
					</li>
				</ul>

				<h2>5. Data Retention</h2>
				<p>
					We will retain your Personal Data only for as long as is necessary for
					the purposes set out in this Privacy Policy. We will retain and use
					your Personal Data to the extent necessary to comply with our legal
					obligations (for example, if we are required to retain your data to
					comply with applicable laws), resolve disputes, and enforce our legal
					agreements and policies.
				</p>

				<h2>6. Your Data Protection Rights (GDPR)</h2>
				<p>
					If you are a resident of the European Economic Area (EEA), you have
					certain data protection rights. We aim to take reasonable steps to
					allow you to correct, amend, delete, or limit the use of your Personal
					Data.
				</p>
				<ul>
					<li>
						<strong>The right to access, update or delete</strong> the
						information we have on you.
					</li>
					<li>
						<strong>The right of rectification.</strong> You have the right to
						have your information rectified if that information is inaccurate or
						incomplete.
					</li>
					<li>
						<strong>The right to object.</strong> You have the right to object
						to our processing of your Personal Data.
					</li>
					<li>
						<strong>The right of restriction.</strong> You have the right to
						request that we restrict the processing of your personal
						information.
					</li>
					<li>
						<strong>The right to data portability.</strong> You have the right
						to be provided with a copy of the information we have on you in a
						structured, machine-readable and commonly used format.
					</li>
					<li>
						<strong>The right to withdraw consent.</strong> You also have the
						right to withdraw your consent at any time where we relied on your
						consent to process your personal information.
					</li>
				</ul>
				<p>
					Please note that we may ask you to verify your identity before
					responding to such requests. You have the right to complain to a Data
					Protection Authority about our collection and use of your Personal
					Data. For more information, please contact your local data protection
					authority in the European Economic Area (EEA).
				</p>

				<h2>7. Data Security</h2>
				<p>
					The security of your data is important to us but remember that no
					method of transmission over the Internet or method of electronic
					storage is 100% secure. While we strive to use commercially acceptable
					means to protect your Personal Data, we cannot guarantee its absolute
					security.
				</p>

				<h2>8. International Data Transfers</h2>
				<p>
					Your information, including Personal Data, may be transferred to — and
					maintained on — computers located outside of your state, province,
					country or other governmental jurisdiction where the data protection
					laws may differ from those from your jurisdiction. If you are located
					outside [Your Country/Region of Operation] and choose to provide
					information to us, please note that we transfer the data, including
					Personal Data, to [Server Location Country/Region, e.g., United
					States] and process it there. Your consent to this Privacy Policy
					followed by your submission of such information represents your
					agreement to that transfer.
				</p>

				<h2>9. Children&apos;s Privacy</h2>
				<p>
					Our Service does not address anyone under the age of 16
					(&quot;Children&quot;). We do not knowingly collect personally
					identifiable information from children under 16. If you are a parent
					or guardian and you are aware that your Child has provided us with
					Personal Data, please contact us. If we become aware that we have
					collected Personal Data from a child under age 16 without verification
					of parental consent, we take steps to remove that information from our
					servers.
				</p>

				<h2>10. Links to Other Websites</h2>
				<p>
					Our Service may contain links to other websites that are not operated
					by us. If you click on a third party link, you will be directed to
					that third party&apos;s site. We strongly advise you to review the
					Privacy Policy of every site you visit. We have no control over and
					assume no responsibility for the content, privacy policies or
					practices of any third party sites or services.
				</p>

				<h2>11. Changes to This Privacy Policy</h2>
				<p>
					We may update our Privacy Policy from time to time. We will notify you
					of any changes by posting the new Privacy Policy on this page and
					updating the &quot;Last Updated&quot; date. You are advised to review
					this Privacy Policy periodically for any changes. Changes to this
					Privacy Policy are effective when they are posted on this page.
				</p>

				<h2>12. Contact Us</h2>
				<p>
					If you have any questions about this Privacy Policy, please contact
					us:
				</p>
				<ul>
					<li>By email: {contactEmail}</li>
					<li>
						By visiting this page on our website:{" "}
						<Link
							href="/contact"
							className="text-blue-600 hover:underline"
						>
							{websiteUrl}/contact
						</Link>{" "}
						{/* Replace with your actual contact page if different */}
					</li>
				</ul>

				{/* <hr />
				<p className="text-xs text-gray-500">
					<em>
						Disclaimer: This Privacy Policy is a template and should be reviewed
						and customized by a legal professional to ensure it meets your
						specific needs and complies with all applicable laws and
						regulations.
					</em>
				</p> */}
			</div>
		</div>
	);
}

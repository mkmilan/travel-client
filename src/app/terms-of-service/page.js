"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
	const lastUpdated = "May 13, 2025"; // Update this date whenever the terms are changed
	const appName = "Motorhome Mapper";
	const companyName = "Your Company Name"; // Replace with your actual company name or your name if individual
	const contactEmail = "your-email@example.com"; // Replace with your contact email
	const websiteUrl = "https://your-app-url.com"; // Replace with your app's URL
	const governingLawJurisdiction = "Your Country/State"; // e.g., "the Republic of Ireland" or "the State of California, USA"

	return (
		<div className="max-w-3xl mx-auto p-4 md:p-8">
			<div className="bg-white p-6 md:p-10 shadow-md border border-gray-200 prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
				<h1>Terms of Service for {appName}</h1>
				<p>
					<strong>Last Updated:</strong> {lastUpdated}
				</p>

				<p>
					Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms of
					Service&quot;) carefully before using the {appName} mobile application
					and website (the &quot;Service&quot;) operated by {companyName}{" "}
					(&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
				</p>
				<p>
					Your access to and use of the Service is conditioned upon your
					acceptance of and compliance with these Terms. These Terms apply to
					all visitors, users, and others who wish to access or use the Service.
					By accessing or using the Service you agree to be bound by these
					Terms. If you disagree with any part of the terms then you do not have
					permission to access the Service.
				</p>

				<h2>1. Accounts</h2>
				<p>
					When you create an account with us, you guarantee that you are above
					the age of 16 and that the information you provide us is accurate,
					complete, and current at all times. Inaccurate, incomplete, or
					obsolete information may result in the immediate termination of your
					account on the Service.
				</p>
				<p>
					You are responsible for maintaining the confidentiality of your
					account and password, including but not limited to the restriction of
					access to your computer and/or account. You agree to accept
					responsibility for any and all activities or actions that occur under
					your account and/or password. You must notify us immediately upon
					becoming aware of any breach of security or unauthorized use of your
					account.
				</p>

				<h2>2. User Content</h2>
				<p>
					Our Service allows you to post, link, store, share and otherwise make
					available certain information, text, graphics, videos, trip data, or
					other material (&quot;Content&quot;). You are responsible for the
					Content that you post on or through the Service, including its
					legality, reliability, and appropriateness.
				</p>
				<p>
					By posting Content on or through the Service, You represent and
					warrant that: (i) the Content is yours (you own it) and/or you have
					the right to use it and the right to grant us the rights and license
					as provided in these Terms, and (ii) the posting of your Content on or
					through the Service does not violate the privacy rights, publicity
					rights, copyrights, contract rights or any other rights of any person
					or entity. We reserve the right to terminate the account of anyone
					found to be infringing on a copyright.
				</p>
				<p>
					You retain any and all of your rights to any Content you submit, post
					or display on or through the Service and you are responsible for
					protecting those rights. We take no responsibility and assume no
					liability for Content you or any third party posts on or through the
					Service. However, by posting Content using the Service you grant us a
					worldwide, non-exclusive, royalty-free, sublicensable license to use,
					modify, publicly perform, publicly display, reproduce, and distribute
					such Content on and through the Service solely for the purposes of
					operating, developing, providing, and using the Service.
				</p>

				<h2>3. Prohibited Uses</h2>
				<p>
					You may use the Service only for lawful purposes and in accordance
					with Terms. You agree not to use the Service:
				</p>
				<ul>
					<li>
						In any way that violates any applicable national or international
						law or regulation.
					</li>
					<li>
						For the purpose of exploiting, harming, or attempting to exploit or
						harm minors in any way by exposing them to inappropriate content or
						otherwise.
					</li>
					<li>
						To transmit, or procure the sending of, any advertising or
						promotional material, including any &quot;junk mail&quot;,
						&quot;chain letter,&quot; &quot;spam,&quot; or any other similar
						solicitation.
					</li>
					<li>
						To impersonate or attempt to impersonate {companyName}, a{" "}
						{companyName} employee, another user, or any other person or entity.
					</li>
					<li>
						In any way that infringes upon the rights of others, or in any way
						is illegal, threatening, fraudulent, or harmful, or in connection
						with any unlawful, illegal, fraudulent, or harmful purpose or
						activity.
					</li>
					<li>
						To engage in any other conduct that restricts or inhibits
						anyone&apos;s use or enjoyment of the Service, or which, as
						determined by us, may harm or offend {companyName} or users of the
						Service or expose them to liability.
					</li>
				</ul>

				<h2>4. Intellectual Property</h2>
				<p>
					The Service and its original content (excluding Content provided by
					users), features and functionality are and will remain the exclusive
					property of {companyName} and its licensors. The Service is protected
					by copyright, trademark, and other laws of both the{" "}
					{governingLawJurisdiction} and foreign countries. Our trademarks and
					trade dress may not be used in connection with any product or service
					without the prior written consent of {companyName}.
				</p>

				<h2>5. Links To Other Web Sites</h2>
				<p>
					Our Service may contain links to third-party web sites or services
					that are not owned or controlled by {companyName}.
				</p>
				<p>
					{companyName} has no control over, and assumes no responsibility for
					the content, privacy policies, or practices of any third-party web
					sites or services. We do not warrant the offerings of any of these
					entities/individuals or their websites.
				</p>
				<p>
					You acknowledge and agree that {companyName} shall not be responsible
					or liable, directly or indirectly, for any damage or loss caused or
					alleged to be caused by or in connection with use of or reliance on
					any such content, goods or services available on or through any such
					third-party web sites or services.
				</p>
				<p>
					We strongly advise you to read the terms and conditions and privacy
					policies of any third-party web sites or services that you visit.
				</p>

				<h2>6. Termination</h2>
				<p>
					We may terminate or suspend your account and bar access to the Service
					immediately, without prior notice or liability, under our sole
					discretion, for any reason whatsoever and without limitation,
					including but not limited to a breach of the Terms.
				</p>
				<p>
					If you wish to terminate your account, you may simply discontinue
					using the Service, or contact us to request deletion.
				</p>
				<p>
					All provisions of the Terms which by their nature should survive
					termination shall survive termination, including, without limitation,
					ownership provisions, warranty disclaimers, indemnity and limitations
					of liability.
				</p>

				<h2>7. Indemnification</h2>
				<p>
					You agree to defend, indemnify and hold harmless {companyName} and its
					licensee and licensors, and their employees, contractors, agents,
					officers and directors, from and against any and all claims, damages,
					obligations, losses, liabilities, costs or debt, and expenses
					(including but not limited to attorney&apos;s fees), resulting from or
					arising out of a) your use and access of the Service, by you or any
					person using your account and password; b) a breach of these Terms, or
					c) Content posted on the Service.
				</p>

				<h2>8. Limitation Of Liability</h2>
				<p>
					In no event shall {companyName}, nor its directors, employees,
					partners, agents, suppliers, or affiliates, be liable for any
					indirect, incidental, special, consequential or punitive damages,
					including without limitation, loss of profits, data, use, goodwill, or
					other intangible losses, resulting from (i) your access to or use of
					or inability to access or use the Service; (ii) any conduct or content
					of any third party on the Service; (iii) any content obtained from the
					Service; and (iv) unauthorized access, use or alteration of your
					transmissions or content, whether based on warranty, contract, tort
					(including negligence) or any other legal theory, whether or not we
					have been informed of the possibility of such damage, and even if a
					remedy set forth herein is found to have failed of its essential
					purpose.
				</p>

				<h2>9. Disclaimer</h2>
				<p>
					Your use of the Service is at your sole risk. The Service is provided
					on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The
					Service is provided without warranties of any kind, whether express or
					implied, including, but not limited to, implied warranties of
					merchantability, fitness for a particular purpose, non-infringement or
					course of performance.
				</p>
				<p>
					{companyName} its subsidiaries, affiliates, and its licensors do not
					warrant that a) the Service will function uninterrupted, secure or
					available at any particular time or location; b) any errors or defects
					will be corrected; c) the Service is free of viruses or other harmful
					components; or d) the results of using the Service will meet your
					requirements.
				</p>

				<h2>10. Governing Law</h2>
				<p>
					These Terms shall be governed and construed in accordance with the
					laws of {governingLawJurisdiction}, without regard to its conflict of
					law provisions.
				</p>
				<p>
					Our failure to enforce any right or provision of these Terms will not
					be considered a waiver of those rights. If any provision of these
					Terms is held to be invalid or unenforceable by a court, the remaining
					provisions of these Terms will remain in effect. These Terms
					constitute the entire agreement between us regarding our Service, and
					supersede and replace any prior agreements we might have had between
					us regarding the Service.
				</p>

				<h2>11. Changes</h2>
				<p>
					We reserve the right, at our sole discretion, to modify or replace
					these Terms at any time. If a revision is material we will provide at
					least 30 days&apos; notice prior to any new terms taking effect. What
					constitutes a material change will be determined at our sole
					discretion.
				</p>
				<p>
					By continuing to access or use our Service after any revisions become
					effective, you agree to be bound by the revised terms. If you do not
					agree to the new terms, you are no longer authorized to use the
					Service.
				</p>

				<h2>12. Contact Us</h2>
				<p>If you have any questions about these Terms, please contact us:</p>
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
						Disclaimer: These Terms of Service are a template and should be
						reviewed and customized by a legal professional to ensure they meet
						your specific needs and comply with all applicable laws and
						regulations.
					</em>
				</p> */}
			</div>
		</div>
	);
}

// src/components/tracking/UserNotice.jsx
import React from "react";

export default function UserNotice() {
	return (
		<div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
			<p className="font-bold">Important:</p>
			<p>
				Tracking requires this page to remain open and active in your browser.
				Background tracking may not work reliably on mobile browsers.
			</p>
		</div>
	);
}

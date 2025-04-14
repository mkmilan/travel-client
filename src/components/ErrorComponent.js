import React from "react";

const ErrorComponent = (props) => {
	console.log("ErrorComponent props:", props);

	return <p className="text-red-500">Error: {props?.message}</p>;
};

export default ErrorComponent;

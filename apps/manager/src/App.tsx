import React from "react";
import "./main.css";
import "./output.css";
import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { routeTree } from "./routes.gen";
import { DialogProvider } from "@hisptz/dhis2-ui";
import "leaflet/dist/leaflet.css";
import { Provider } from "@dhis2/app-runtime";

const hashHistory = createHashHistory();

const router = createRouter({ routeTree, history: hashHistory });


// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const dhis2Config = {
	baseUrl: process.env.REACT_APP_DHIS2_BASE_URL || "/api",
	apiVersion: process.env.REACT_APP_DHIS2_API_VERSION || "39",
};

const MyApp = () => (
	<Provider config={dhis2Config}>
		<DialogProvider>
			<RouterProvider router={router} />
		</DialogProvider>
	</Provider>
);
export default MyApp;

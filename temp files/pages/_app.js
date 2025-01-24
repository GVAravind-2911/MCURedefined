// src/pages/_app.js

import "../styles/blog.css";
import "../styles/blogedit.css";
import "../styles/blogposts.css";
import "../styles/collaboratePage.css";
import "../styles/createblog.css";
import "../styles/editblogpage.css";
import "../styles/home.css";
import "../styles/projectinfo.css";
import "../styles/style.css";
import "../styles/timeline.css";
import "../styles/preview.css";
import "../styles/LoadingSpinner.css"
import Head from "next/head";

function MyApp({ Component, pageProps }) {
	return (
	<>
	<Head>
		<title>MCU Redefined</title>
	</Head>
	<Component {...pageProps} />
	</>
);
}

export default MyApp;

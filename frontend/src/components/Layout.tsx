import type { LayoutProps } from "@/types/StructureTypes";
import type React from "react";
import Footer from "./main/Footer";
import HeaderWrapper from "./main/HeaderWrapper";

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="home-container">
			<HeaderWrapper />
			<div className="main-content-wrapper">{children}</div>
			<Footer />
		</div>
	);
};

export default Layout;

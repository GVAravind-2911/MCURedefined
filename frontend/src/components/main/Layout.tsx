import type { LayoutProps } from "@/types/StructureTypes";
import type React from "react";
import Footer from "./Footer";
import HeaderWrapper from "./HeaderWrapper";
import ImpersonationBanner from "@/components/shared/ImpersonationBanner";

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="home-container">
			<ImpersonationBanner />
			<HeaderWrapper />
			<div className="main-content-wrapper">{children}</div>
			<Footer />
		</div>
	);
};

export default Layout;

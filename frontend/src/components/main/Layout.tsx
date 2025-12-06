import type { LayoutProps } from "@/types/StructureTypes";
import type React from "react";
import Footer from "./Footer";
import HeaderWrapper from "./HeaderWrapper";
import ImpersonationBanner from "@/components/shared/ImpersonationBanner";

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="pt-[100px] mt-0 min-h-screen bg-black">
			<ImpersonationBanner />
			<HeaderWrapper />
			<div className="min-h-[calc(150vh-80px-250px)] flex flex-col w-full">
				{children}
			</div>
			<Footer />
		</div>
	);
};

export default Layout;

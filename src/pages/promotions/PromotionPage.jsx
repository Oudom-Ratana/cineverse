
// Promotion page 

import { Outlet } from "react-router-dom";
import ActivePromosSection from "../../components/promotions/ActivePromosSection";
import PromoHero from "../../components/promotions/PromoHero";
import PromoTicker from "../../components/promotions/PromoTicker";


export default function PromotionPage() {
    return(
        <div className="space-y-12 pb-8">
            <PromoHero/>
            <PromoTicker/>
            <ActivePromosSection/>
            <Outlet/>
        </div>
    )

}

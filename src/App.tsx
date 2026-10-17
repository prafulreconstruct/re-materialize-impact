import { useEffect } from "react";
import { BrowserRouter, Route, Routes, matchPath, useLocation } from "react-router-dom";
import { AppProvider } from "./lib/store";
import { RouteContextProvider } from "./lib/router-compat";
import { Route as HomeRoute } from "./routes/index";
import { Route as BrowseRoute } from "./routes/browse";
import { Route as ListingRoute } from "./routes/listing.$id";
import { Route as LoginRoute } from "./routes/login";
import { Route as SignupRoute } from "./routes/signup";
import { Route as PrivacyRoute } from "./routes/privacy";
import { Route as TermsRoute } from "./routes/terms";
import { Route as AboutRoute } from "./routes/about";
import { Route as ContactRoute } from "./routes/contact";
import { Route as MissionRoute } from "./routes/mission";
import { Route as NgoRoute } from "./routes/ngo";
import { Route as BuyerLayoutRoute } from "./routes/dashboard.buyer";
import { Route as BuyerOverviewRoute } from "./routes/dashboard.buyer.index";
import { Route as BuyerCartRoute } from "./routes/dashboard.buyer.cart";
import { Route as BuyerInterestsRoute } from "./routes/dashboard.buyer.interests";
import { Route as BuyerMessagesRoute } from "./routes/dashboard.buyer.messages";
import { Route as BuyerPurchasesRoute } from "./routes/dashboard.buyer.purchases";
import { Route as SellerLayoutRoute } from "./routes/dashboard.seller";
import { Route as SellerOverviewRoute } from "./routes/dashboard.seller.index";
import { Route as SellerListingsRoute } from "./routes/dashboard.seller.listings";
import { Route as SellerInterestsRoute } from "./routes/dashboard.seller.interests";
import { Route as SellerMessagesRoute } from "./routes/dashboard.seller.messages";

const DEFAULT_TITLE = "RE/CONSTRUCT — The salvage yard for NCR construction";
const DEFAULT_DESCRIPTION =
  "Salvaged & surplus building materials from NCR demolition and construction sites. Verified, listed, and matched with NGOs, builders and homeowners.";

const headRegistry = [
  { path: "/browse", head: BrowseRoute.options.head },
  { path: "/listing/:id", head: ListingRoute.options.head },
  { path: "/login", head: LoginRoute.options.head },
  { path: "/signup", head: SignupRoute.options.head },
  { path: "/privacy", head: PrivacyRoute.options.head },
  { path: "/terms", head: TermsRoute.options.head },
  { path: "/about", head: AboutRoute.options.head },
  { path: "/contact", head: ContactRoute.options.head },
  { path: "/mission", head: MissionRoute.options.head },
  { path: "/ngo", head: NgoRoute.options.head },
  { path: "/dashboard/buyer", head: BuyerLayoutRoute.options.head },
  { path: "/dashboard/seller", head: SellerLayoutRoute.options.head },
];

function DocumentMeta() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const match = headRegistry.find((entry) =>
      matchPath({ path: entry.path, end: false }, pathname),
    );
    const head = match?.head?.();
    const titleMeta = head?.meta?.find((item) => "title" in item);
    const descriptionMeta = head?.meta?.find((item) => item.name === "description");

    document.title = titleMeta?.title ?? DEFAULT_TITLE;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute("content", descriptionMeta?.content ?? DEFAULT_DESCRIPTION);
    }
  }, [location.pathname]);

  return null;
}

// BrowserRouter keeps the old scroll position on navigation; start each new page at the top.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const HomePage = HomeRoute.options.component!;
const BrowsePage = BrowseRoute.options.component!;
const ListingPage = ListingRoute.options.component!;
const LoginPage = LoginRoute.options.component!;
const SignupPage = SignupRoute.options.component!;
const PrivacyPage = PrivacyRoute.options.component!;
const TermsPage = TermsRoute.options.component!;
const AboutPage = AboutRoute.options.component!;
const ContactPage = ContactRoute.options.component!;
const MissionPage = MissionRoute.options.component!;
const NgoPage = NgoRoute.options.component!;
const BuyerLayoutPage = BuyerLayoutRoute.options.component!;
const BuyerOverviewPage = BuyerOverviewRoute.options.component!;
const BuyerCartPage = BuyerCartRoute.options.component!;
const BuyerInterestsPage = BuyerInterestsRoute.options.component!;
const BuyerMessagesPage = BuyerMessagesRoute.options.component!;
const BuyerPurchasesPage = BuyerPurchasesRoute.options.component!;
const SellerLayoutPage = SellerLayoutRoute.options.component!;
const SellerOverviewPage = SellerOverviewRoute.options.component!;
const SellerListingsPage = SellerListingsRoute.options.component!;
const SellerInterestsPage = SellerInterestsRoute.options.component!;
const SellerMessagesPage = SellerMessagesRoute.options.component!;

export function App() {
  return (
    <BrowserRouter>
      <RouteContextProvider value={{}}>
        <AppProvider>
          <DocumentMeta />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/listing/:id" element={<ListingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/ngo" element={<NgoPage />} />
            <Route path="/dashboard/buyer" element={<BuyerLayoutPage />}>
              <Route index element={<BuyerOverviewPage />} />
              <Route path="cart" element={<BuyerCartPage />} />
              <Route path="interests" element={<BuyerInterestsPage />} />
              <Route path="messages" element={<BuyerMessagesPage />} />
              <Route path="purchases" element={<BuyerPurchasesPage />} />
            </Route>
            <Route path="/dashboard/seller" element={<SellerLayoutPage />}>
              <Route index element={<SellerOverviewPage />} />
              <Route path="listings" element={<SellerListingsPage />} />
              <Route path="interests" element={<SellerInterestsPage />} />
              <Route path="messages" element={<SellerMessagesPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppProvider>
      </RouteContextProvider>
    </BrowserRouter>
  );
}

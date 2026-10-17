import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { AppLoader } from "@/components/app-loader";
import { supabase } from "./supabase";
import type { CategoryIcon } from "./catalog";

export type Role = "buyer" | "seller";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  address?: string;
  gst?: string;
};

export type Category = {
  id: string;
  code: string;
  key: string;
  label: string;
  icon: CategoryIcon;
  sortOrder: number;
};

export type Listing = {
  id: string;
  sellerId: string;
  sellerName: string;
  cat: string;
  catCode: string;
  catLabel: string;
  categoryId: string;
  name: string;
  description: string;
  loc: string;
  price: number;
  market: number;
  source: "Demolition" | "Excess stock";
  icon: CategoryIcon;
  status: "live" | "paused" | "sold";
  views: number;
  createdAt: number;
  imagePaths: string[];
  imageUrls: string[];
};

export type Interest = {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  quotePrice: number;
  deliveryPref: string;
  note: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: number;
  threadId?: string;
};

export type CartItem = {
  id: string;
  listingId: string;
  addedAt: number;
};

export type Purchase = {
  id: string;
  listingId: string;
  listingName: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  date: number;
  status: "completed";
};

export type Message = {
  id: string;
  threadId: string;
  fromId: string;
  text: string;
  at: number;
};

export type Thread = {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: number;
};

type State = {
  categories: Category[];
  listings: Listing[];
  interests: Interest[];
  cart: Record<string, CartItem[]>;
  purchases: Purchase[];
  threads: Thread[];
  messages: Message[];
};

type SignupInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  address?: string;
  gst?: string;
};

type ListingInput = Omit<
  Listing,
  | "id"
  | "sellerId"
  | "sellerName"
  | "status"
  | "views"
  | "createdAt"
  | "icon"
  | "categoryId"
  | "imageUrls"
> & {
  imagePaths: string[];
};

type RawCategory = {
  id: string;
  code: string;
  key: string;
  label: string;
  icon: CategoryIcon;
  sort_order: number | null;
};

export type RawListing = {
  id: string;
  seller_id: string;
  seller_name: string;
  category_id: string;
  name: string;
  description: string;
  location: string;
  price: number | string;
  market_price: number | string | null;
  source: Listing["source"];
  status: Listing["status"];
  views: number | null;
  created_at: string;
  image_paths?: string[] | null;
  category: RawCategory;
};

type RawInterest = {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  seller_id: string;
  seller_name: string;
  quote_price: number | string;
  delivery_preference: string;
  note: string | null;
  status: Interest["status"];
  created_at: string;
  thread_id: string | null;
};

type RawThread = {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  created_at: string;
};

type RawMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type RawPurchase = {
  id: string;
  listing_id: string;
  listing_name: string;
  buyer_id: string;
  seller_id: string;
  seller_name: string;
  price: number | string;
  status: Purchase["status"];
  created_at: string;
};

type Ctx = {
  state: State;
  currentUser: User | null;
  session: Session | null;
  isInitializing: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signup: (data: SignupInput) => Promise<{ user: User | null; needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  addListing: (l: ListingInput) => Promise<void>;
  updateListing: (
    id: string,
    patch: Partial<Omit<Listing, "imageUrls">> & { imagePaths?: string[] },
  ) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  addToCart: (listingId: string) => Promise<void>;
  removeFromCart: (listingId: string) => Promise<void>;
  checkoutCart: () => Promise<void>;
  submitInterest: (data: {
    listingId: string;
    quotePrice: number;
    deliveryPref: string;
    note: string;
  }) => Promise<void>;
  withdrawInterest: (id: string) => Promise<void>;
  acceptInterest: (id: string) => Promise<string>;
  rejectInterest: (id: string) => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markThreadRead: (threadId: string) => void;
  countUnreadMessages: (userId: string) => number;
  hasUnreadInThread: (userId: string, threadId: string) => boolean;
};

const INITIAL: State = {
  categories: [],
  listings: [],
  interests: [],
  cart: {},
  purchases: [],
  threads: [],
  messages: [],
};

const AppContext = createContext<Ctx | null>(null);

function readCursorsKey(userId: string) {
  return `reconstruct-thread-read-${userId}`;
}

function loadReadCursors(userId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(readCursorsKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export const listingSelectWithImages = `
  id,
  seller_id,
  seller_name,
  category_id,
  name,
  description,
  location,
  price,
  market_price,
  source,
  status,
  views,
  created_at,
  image_paths,
  category:material_categories (
    id,
    key,
    code,
    label,
    icon
  )
`;

const listingSelectWithoutImages = `
  id,
  seller_id,
  seller_name,
  category_id,
  name,
  description,
  location,
  price,
  market_price,
  source,
  status,
  views,
  created_at,
  category:material_categories (
    id,
    key,
    code,
    label,
    icon
  )
`;

const LISTING_IMAGE_BUCKET = "listing-images";

function ensure<T>(value: T | null | undefined, message: string): T {
  if (value == null) {
    throw new Error(message);
  }
  return value;
}

function mapUser(profile: Record<string, unknown>): User {
  return {
    id: String(profile.id),
    name: String(profile.full_name ?? ""),
    email: String(profile.email ?? ""),
    phone: String(profile.phone ?? ""),
    role: String(profile.role) as Role,
    address: profile.address ? String(profile.address) : undefined,
    gst: profile.gst_number ? String(profile.gst_number) : undefined,
  };
}

function listingImageUrl(path: string) {
  return supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function mapListing(row: RawListing): Listing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    categoryId: row.category_id,
    cat: row.category.key,
    catCode: row.category.code,
    catLabel: row.category.label,
    name: row.name,
    description: row.description,
    loc: row.location,
    price: Number(row.price),
    market: Number(row.market_price ?? 0),
    source: row.source,
    icon: row.category.icon,
    status: row.status,
    views: Number(row.views ?? 0),
    createdAt: new Date(row.created_at).getTime(),
    imagePaths: row.image_paths ?? [],
    imageUrls: (row.image_paths ?? []).map(listingImageUrl),
  };
}

function mapCategory(row: RawCategory): Category {
  return {
    id: row.id,
    code: row.code,
    key: row.key,
    label: row.label,
    icon: row.icon,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapInterest(row: RawInterest): Interest {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    quotePrice: Number(row.quote_price),
    deliveryPref: row.delivery_preference,
    note: row.note ?? "",
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    threadId: row.thread_id ?? undefined,
  };
}

function mapThread(row: RawThread): Thread {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    sellerPhone: row.seller_phone,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapMessage(row: RawMessage): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    fromId: row.sender_id,
    text: row.body,
    at: new Date(row.created_at).getTime(),
  };
}

function mapPurchase(row: RawPurchase): Purchase {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingName: row.listing_name,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    price: Number(row.price),
    date: new Date(row.created_at).getTime(),
    status: row.status,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pendingOps, setPendingOps] = useState(0);
  const [readCursors, setReadCursors] = useState<Record<string, number>>({});

  const runWithLoading = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    setPendingOps((count) => count + 1);
    try {
      return await operation();
    } finally {
      setPendingOps((count) => Math.max(0, count - 1));
    }
  }, []);

  const isLoading = isInitializing || pendingOps > 0;

  const fetchAppData = useCallback(async (activeSession: Session | null) => {
    const [{ data: categoriesData, error: categoriesError }, listingsResult] = await Promise.all([
      supabase.from("material_categories").select("*").order("sort_order"),
      supabase
        .from("listings")
        .select(listingSelectWithImages)
        .order("created_at", { ascending: false }),
    ]);

    if (categoriesError) throw categoriesError;

    let listingsData = listingsResult.data;
    let listingsError = listingsResult.error;
    if (listingsError?.code === "42703") {
      const fallback = await supabase
        .from("listings")
        .select(listingSelectWithoutImages)
        .order("created_at", { ascending: false });
      listingsData = fallback.data;
      listingsError = fallback.error;
    }

    if (listingsError) throw listingsError;

    let nextUser: User | null = null;
    let nextState: State = {
      categories: (categoriesData ?? []).map(mapCategory),
      listings: (listingsData ?? []).map((row) => mapListing(row as RawListing)),
      interests: [],
      cart: {},
      purchases: [],
      threads: [],
      messages: [],
    };

    if (!activeSession?.user) {
      setCurrentUser(null);
      setState(nextState);
      setReadCursors({});
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", activeSession.user.id)
      .single();

    if (profileError) throw profileError;

    nextUser = mapUser(profileData);

    const [
      { data: interestsData, error: interestsError },
      { data: cartData, error: cartError },
      { data: purchasesData, error: purchasesError },
      { data: threadsData, error: threadsError },
    ] = await Promise.all([
      supabase.from("interests").select("*").order("created_at", { ascending: false }),
      supabase
        .from("cart_items")
        .select("id, listing_id, created_at")
        .eq("buyer_id", activeSession.user.id)
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("threads").select("*").order("created_at", { ascending: false }),
    ]);

    if (interestsError) throw interestsError;
    if (cartError) throw cartError;
    if (purchasesError) throw purchasesError;
    if (threadsError) throw threadsError;

    const threadIds = (threadsData ?? []).map((thread) => thread.id);
    const { data: messagesData, error: messagesError } = threadIds.length
      ? await supabase
          .from("messages")
          .select("*")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };

    if (messagesError) throw messagesError;

    nextState = {
      ...nextState,
      interests: (interestsData ?? []).map(mapInterest),
      cart: {
        [activeSession.user.id]: (cartData ?? []).map((item) => ({
          id: item.id,
          listingId: item.listing_id,
          addedAt: new Date(item.created_at).getTime(),
        })),
      },
      purchases: (purchasesData ?? []).map(mapPurchase),
      threads: (threadsData ?? []).map(mapThread),
      messages: (messagesData ?? []).map(mapMessage),
    };

    setCurrentUser(nextUser);
    setState(nextState);
    setReadCursors(loadReadCursors(nextUser.id));
  }, []);

  const loadAppData = useCallback(
    async (activeSession: Session | null) => runWithLoading(() => fetchAppData(activeSession)),
    [fetchAppData, runWithLoading],
  );

  const refresh = useCallback(async () => {
    return runWithLoading(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(data.session);
      await fetchAppData(data.session);
    });
  }, [fetchAppData, runWithLoading]);

  const refreshMessages = useCallback(async () => {
    if (!session?.user) return;

    const { data: threadsData, error: threadsError } = await supabase
      .from("threads")
      .select("*")
      .order("created_at", { ascending: false });

    if (threadsError) throw threadsError;

    const threadIds = (threadsData ?? []).map((thread) => thread.id);
    const { data: messagesData, error: messagesError } = threadIds.length
      ? await supabase
          .from("messages")
          .select("*")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };

    if (messagesError) throw messagesError;

    setState((prev) => ({
      ...prev,
      threads: (threadsData ?? []).map(mapThread),
      messages: (messagesData ?? []).map(mapMessage),
    }));
  }, [session?.user]);

  const markThreadRead = useCallback(
    (threadId: string) => {
      if (!currentUser) return;
      setReadCursors((prev) => {
        const threadMessages = state.messages.filter((m) => m.threadId === threadId);
        const latest = threadMessages.reduce((max, m) => Math.max(max, m.at), 0);
        const readAt = Math.max(prev[threadId] ?? 0, latest);
        if (readAt === prev[threadId]) return prev;
        const next = { ...prev, [threadId]: readAt };
        localStorage.setItem(readCursorsKey(currentUser.id), JSON.stringify(next));
        return next;
      });
    },
    [currentUser, state.messages],
  );

  const countUnreadMessages = useCallback(
    (userId: string) => {
      const myThreadIds = state.threads
        .filter((t) => t.buyerId === userId || t.sellerId === userId)
        .map((t) => t.id);
      return state.messages.filter(
        (m) =>
          myThreadIds.includes(m.threadId) &&
          m.fromId !== userId &&
          m.at > (readCursors[m.threadId] ?? 0),
      ).length;
    },
    [readCursors, state.messages, state.threads],
  );

  const hasUnreadInThread = useCallback(
    (userId: string, threadId: string) =>
      state.messages.some(
        (m) =>
          m.threadId === threadId && m.fromId !== userId && m.at > (readCursors[threadId] ?? 0),
      ),
    [readCursors, state.messages],
  );

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;
        setSession(data.session);
        await loadAppData(data.session);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    void boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadAppData(nextSession).catch((error) => {
        console.error(error);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadAppData]);

  const login = useCallback<Ctx["login"]>(
    async (email, password) => {
      return runWithLoading(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        await loadAppData(data.session);

        const profile = ensure(
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()
            .then(({ data: profileData, error: profileError }) => {
              if (profileError) throw profileError;
              return mapUser(profileData);
            }),
          "Unable to load your account.",
        );

        return profile;
      });
    },
    [loadAppData, runWithLoading],
  );

  const signup = useCallback<Ctx["signup"]>(
    async (data) => {
      return runWithLoading(async () => {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.name,
              role: data.role,
              phone: data.phone,
              address: data.address ?? "",
              gst_number: data.gst ?? "",
            },
          },
        });

        if (error) throw error;

        const needsEmailConfirmation = !authData.session;

        if (authData.session) {
          await loadAppData(authData.session);
        }

        return {
          user: currentUser,
          needsEmailConfirmation,
        };
      });
    },
    [currentUser, loadAppData, runWithLoading],
  );

  const logout = useCallback(async () => {
    return runWithLoading(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      setState(INITIAL);
      setReadCursors({});
    });
  }, [runWithLoading]);

  const categoriesByKey = useMemo(
    () => new Map(state.categories.map((category) => [category.key, category])),
    [state.categories],
  );

  const addListing = useCallback<Ctx["addListing"]>(
    async (listing) => {
      return runWithLoading(async () => {
        if (!currentUser) throw new Error("Please log in first.");
        const category = ensure(
          categoriesByKey.get(listing.cat),
          "Choose a valid category before saving the listing.",
        );

        const { error } = await supabase.from("listings").insert({
          seller_id: currentUser.id,
          seller_name: currentUser.name,
          category_id: category.id,
          name: listing.name,
          description: listing.description,
          location: listing.loc,
          price: listing.price,
          market_price: listing.market,
          source: listing.source,
          image_paths: listing.imagePaths,
        });

        if (error) throw error;
        await refresh();
      });
    },
    [categoriesByKey, currentUser, refresh, runWithLoading],
  );

  const updateListing = useCallback<Ctx["updateListing"]>(
    async (id, patch) => {
      return runWithLoading(async () => {
        const update: Record<string, unknown> = {};
        if (patch.cat) {
          const category = ensure(
            categoriesByKey.get(patch.cat),
            "Choose a valid category before saving the listing.",
          );
          update.category_id = category.id;
        }
        if (patch.name !== undefined) update.name = patch.name;
        if (patch.description !== undefined) update.description = patch.description;
        if (patch.loc !== undefined) update.location = patch.loc;
        if (patch.price !== undefined) update.price = patch.price;
        if (patch.market !== undefined) update.market_price = patch.market;
        if (patch.source !== undefined) update.source = patch.source;
        if (patch.status !== undefined) update.status = patch.status;
        if (patch.imagePaths !== undefined) update.image_paths = patch.imagePaths;

        const { error } = await supabase.from("listings").update(update).eq("id", id);
        if (error) throw error;
        await refresh();
      });
    },
    [categoriesByKey, refresh, runWithLoading],
  );

  const deleteListing = useCallback<Ctx["deleteListing"]>(
    async (id) => {
      return runWithLoading(async () => {
        const { error } = await supabase.from("listings").delete().eq("id", id);
        if (error) throw error;
        await refresh();
      });
    },
    [refresh, runWithLoading],
  );

  const addToCart = useCallback<Ctx["addToCart"]>(
    async (listingId) => {
      return runWithLoading(async () => {
        if (!currentUser) throw new Error("Please log in first.");
        const { error } = await supabase.from("cart_items").upsert(
          {
            buyer_id: currentUser.id,
            listing_id: listingId,
          },
          { onConflict: "buyer_id,listing_id" },
        );
        if (error) throw error;
        await refresh();
      });
    },
    [currentUser, refresh, runWithLoading],
  );

  const removeFromCart = useCallback<Ctx["removeFromCart"]>(
    async (listingId) => {
      return runWithLoading(async () => {
        if (!currentUser) throw new Error("Please log in first.");
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("buyer_id", currentUser.id)
          .eq("listing_id", listingId);
        if (error) throw error;
        await refresh();
      });
    },
    [currentUser, refresh, runWithLoading],
  );

  const checkoutCart = useCallback<Ctx["checkoutCart"]>(async () => {
    return runWithLoading(async () => {
      if (!currentUser) throw new Error("Please log in first.");
      const cartItems = state.cart[currentUser.id] ?? [];
      if (!cartItems.length) return;

      const listings = cartItems
        .map((item) => state.listings.find((listing) => listing.id === item.listingId))
        .filter((listing): listing is Listing => Boolean(listing));

      const { error: insertError } = await supabase.from("orders").insert(
        listings.map((listing) => ({
          listing_id: listing.id,
          listing_name: listing.name,
          buyer_id: currentUser.id,
          seller_id: listing.sellerId,
          seller_name: listing.sellerName,
          price: listing.price,
        })),
      );

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("buyer_id", currentUser.id);
      if (deleteError) throw deleteError;

      await refresh();
    });
  }, [currentUser, refresh, runWithLoading, state.cart, state.listings]);

  const submitInterest = useCallback<Ctx["submitInterest"]>(
    async (data) => {
      return runWithLoading(async () => {
        if (!currentUser) throw new Error("Please log in first.");
        const listing = ensure(
          state.listings.find((item) => item.id === data.listingId),
          "That listing is no longer available.",
        );

        const { error } = await supabase.from("interests").insert({
          listing_id: listing.id,
          buyer_id: currentUser.id,
          buyer_name: currentUser.name,
          buyer_phone: currentUser.phone,
          seller_id: listing.sellerId,
          seller_name: listing.sellerName,
          quote_price: data.quotePrice,
          delivery_preference: data.deliveryPref,
          note: data.note.trim(),
        });

        if (error) throw error;
        await refresh();
      });
    },
    [currentUser, refresh, runWithLoading, state.listings],
  );

  const withdrawInterest = useCallback<Ctx["withdrawInterest"]>(
    async (id) => {
      return runWithLoading(async () => {
        const { error } = await supabase
          .from("interests")
          .update({ status: "withdrawn" })
          .eq("id", id);
        if (error) throw error;
        await refresh();
      });
    },
    [refresh, runWithLoading],
  );

  const acceptInterest = useCallback<Ctx["acceptInterest"]>(
    async (id) => {
      return runWithLoading(async () => {
        if (!currentUser) throw new Error("Please log in first.");
        const interest = ensure(
          state.interests.find((item) => item.id === id),
          "That buyer interest is no longer available.",
        );

        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .insert({
            listing_id: interest.listingId,
            buyer_id: interest.buyerId,
            buyer_name: interest.buyerName,
            buyer_phone: interest.buyerPhone,
            seller_id: currentUser.id,
            seller_name: currentUser.name,
            seller_phone: currentUser.phone,
          })
          .select("id")
          .single();

        if (threadError) throw threadError;

        const threadId = threadData.id;

        const { error: updateError } = await supabase
          .from("interests")
          .update({ status: "accepted", thread_id: threadId })
          .eq("id", id);
        if (updateError) throw updateError;

        const { error: messageError } = await supabase.from("messages").insert({
          thread_id: threadId,
          sender_id: currentUser.id,
          body: `Hi ${interest.buyerName}, I've accepted your quote of ₹${interest.quotePrice.toLocaleString(
            "en-IN",
          )}. Let's coordinate pickup.`,
        });
        if (messageError) throw messageError;

        await refresh();
        return threadId;
      });
    },
    [currentUser, refresh, runWithLoading, state.interests],
  );

  const rejectInterest = useCallback<Ctx["rejectInterest"]>(
    async (id) => {
      return runWithLoading(async () => {
        const { error } = await supabase
          .from("interests")
          .update({ status: "rejected" })
          .eq("id", id);
        if (error) throw error;
        await refresh();
      });
    },
    [refresh, runWithLoading],
  );

  const sendMessage = useCallback<Ctx["sendMessage"]>(
    async (threadId, text) => {
      if (!currentUser || !text.trim()) return;

      const trimmed = text.trim();
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        threadId,
        fromId: currentUser.id,
        text: trimmed,
        at: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));

      const { data, error } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_id: currentUser.id,
          body: trimmed,
        })
        .select("*")
        .single();

      if (error) {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== optimisticId),
        }));
        throw error;
      }

      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === optimisticId ? mapMessage(data as RawMessage) : m,
        ),
      }));
    },
    [currentUser],
  );

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        session,
        isInitializing,
        isLoading,
        refresh,
        refreshMessages,
        login,
        signup,
        logout,
        addListing,
        updateListing,
        deleteListing,
        addToCart,
        removeFromCart,
        checkoutCart,
        submitInterest,
        withdrawInterest,
        acceptInterest,
        rejectInterest,
        sendMessage,
        markThreadRead,
        countUnreadMessages,
        hasUnreadInThread,
      }}
    >
      {children}
      <AppLoader />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

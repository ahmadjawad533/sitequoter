"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { PriceItemInput, CompanySettingsInput } from "@/lib/validations/priceBook";

export interface PriceItem {
  id: string;
  company_id?: string;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  created_at?: string;
}

export interface CompanySettings {
  id?: string;
  name?: string;
  labor_rate: number;
  markup_percent: number;
  min_margin_percent: number;
}

const DEFAULT_MOCK_ITEMS: PriceItem[] = [
  {
    id: "item-1",
    name: "Capacitor 45/5 MFD 440V",
    category: "Electrical",
    unit: "each",
    unit_price: 38.0,
  },
  {
    id: "item-2",
    name: "Contactor 30A 2-Pole",
    category: "Electrical",
    unit: "each",
    unit_price: 42.0,
  },
  {
    id: "item-3",
    name: "R-410A Refrigerant",
    category: "Refrigeration",
    unit: "lb",
    unit_price: 45.0,
  },
  {
    id: "item-4",
    name: "Digital Non-Programmable Thermostat",
    category: "Controls",
    unit: "each",
    unit_price: 65.0,
  },
  {
    id: "item-5",
    name: "Hard Start Kit (SPP6)",
    category: "Electrical",
    unit: "each",
    unit_price: 55.0,
  },
  {
    id: "item-6",
    name: "Condensate Drain Line Cleanout",
    category: "Maintenance",
    unit: "service",
    unit_price: 25.0,
  },
];

const DEFAULT_SETTINGS: CompanySettings = {
  labor_rate: 95.0,
  markup_percent: 20.0,
  min_margin_percent: 25.0,
};

export function usePriceBook() {
  const [items, setItems] = React.useState<PriceItem[]>([]);
  const [settings, setSettings] = React.useState<CompanySettings>(DEFAULT_SETTINGS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isMock = React.useMemo(() => {
    if (typeof window === "undefined") return true;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return (
      !url ||
      url.includes("placeholder") ||
      url.includes("your-project") ||
      process.env.AUTH_MODE === "mock"
    );
  }, []);

  // Fetch initial items and company settings
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMock) {
        // Read from localStorage
        const storedItems = localStorage.getItem("sitequote_price_items");
        if (storedItems) {
          try {
            setItems(JSON.parse(storedItems));
          } catch {
            setItems(DEFAULT_MOCK_ITEMS);
            localStorage.setItem("sitequote_price_items", JSON.stringify(DEFAULT_MOCK_ITEMS));
          }
        } else {
          setItems(DEFAULT_MOCK_ITEMS);
          localStorage.setItem("sitequote_price_items", JSON.stringify(DEFAULT_MOCK_ITEMS));
        }

        const storedSettings = localStorage.getItem("sitequote_company_settings");
        if (storedSettings) {
          try {
            setSettings(JSON.parse(storedSettings));
          } catch {
            setSettings(DEFAULT_SETTINGS);
          }
        } else {
          // Check mock user cookie
          const match = document.cookie.match(/sitequote_mock_user=([^;]+)/);
          if (match) {
            try {
              const u = JSON.parse(decodeURIComponent(match[1]));
              if (u.labor_rate) {
                const s = {
                  labor_rate: u.labor_rate,
                  markup_percent: u.markup_percent,
                  min_margin_percent: u.min_margin_percent,
                };
                setSettings(s);
                localStorage.setItem("sitequote_company_settings", JSON.stringify(s));
              }
            } catch {}
          }
        }
        return;
      }

      // Live Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User session expired. Please log in.");
      }

      // Get profile with company_id
      const { data: profile, error: profErr } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profErr || !profile?.company_id) {
        throw new Error("Company profile not found.");
      }

      const companyId = profile.company_id;

      // 1. Fetch items
      const { data: itemsData, error: itemsErr } = await (supabase.from("price_items") as any)
        .select("*")
        .eq("company_id", companyId)
        .order("name", { ascending: true });

      if (itemsErr) throw itemsErr;
      setItems(itemsData || []);

      // 2. Fetch company settings
      const { data: companyData, error: compErr } = await (supabase.from("companies") as any)
        .select("*")
        .eq("id", companyId)
        .single();

      if (compErr) throw compErr;
      if (companyData) {
        setSettings({
          id: companyData.id,
          name: companyData.name,
          labor_rate: Number(companyData.labor_rate),
          markup_percent: Number(companyData.markup_percent),
          min_margin_percent: Number(companyData.min_margin_percent),
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load price book.");
    } finally {
      setLoading(false);
    }
  }, [isMock]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Add Item
  const addItem = async (input: PriceItemInput) => {
    setSaving(true);
    setError(null);

    try {
      if (isMock) {
        const newItem: PriceItem = {
          id: "item-" + Date.now(),
          name: input.name,
          category: input.category || "General",
          unit: input.unit || "each",
          unit_price: Number(input.unit_price),
        };
        const updated = [...items, newItem];
        setItems(updated);
        localStorage.setItem("sitequote_price_items", JSON.stringify(updated));
        return newItem;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user!.id)
        .single();

      const { data, error: insertErr } = await (supabase.from("price_items") as any)
        .insert({
          company_id: profile.company_id,
          name: input.name,
          category: input.category || "General",
          unit: input.unit || "each",
          unit_price: input.unit_price,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      setItems((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err?.message || "Failed to add item.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Update Item
  const updateItem = async (id: string, input: PriceItemInput) => {
    setSaving(true);
    setError(null);

    try {
      if (isMock) {
        const updated = items.map((it) =>
          it.id === id
            ? {
                ...it,
                name: input.name,
                category: input.category || "General",
                unit: input.unit || "each",
                unit_price: Number(input.unit_price),
              }
            : it
        );
        setItems(updated);
        localStorage.setItem("sitequote_price_items", JSON.stringify(updated));
        return;
      }

      const supabase = createClient();
      const { data, error: updateErr } = await (supabase.from("price_items") as any)
        .update({
          name: input.name,
          category: input.category || "General",
          unit: input.unit || "each",
          unit_price: input.unit_price,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      setItems((prev) => prev.map((it) => (it.id === id ? data : it)));
    } catch (err: any) {
      setError(err?.message || "Failed to update item.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const deleteItem = async (id: string) => {
    setSaving(true);
    setError(null);

    try {
      if (isMock) {
        const updated = items.filter((it) => it.id !== id);
        setItems(updated);
        localStorage.setItem("sitequote_price_items", JSON.stringify(updated));
        return;
      }

      const supabase = createClient();
      const { error: delErr } = await (supabase.from("price_items") as any)
        .delete()
        .eq("id", id);

      if (delErr) throw delErr;
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete item.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Bulk CSV Import
  const importCsvItems = async (newItems: PriceItemInput[]) => {
    setSaving(true);
    setError(null);

    try {
      if (isMock) {
        const formatted: PriceItem[] = newItems.map((input, idx) => ({
          id: `csv-${Date.now()}-${idx}`,
          name: input.name,
          category: input.category || "General",
          unit: input.unit || "each",
          unit_price: Number(input.unit_price),
        }));

        const updated = [...items, ...formatted];
        setItems(updated);
        localStorage.setItem("sitequote_price_items", JSON.stringify(updated));
        return formatted.length;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user!.id)
        .single();

      const toInsert = newItems.map((it) => ({
        company_id: profile.company_id,
        name: it.name,
        category: it.category || "General",
        unit: it.unit || "each",
        unit_price: it.unit_price,
      }));

      const { data, error: insertErr } = await (supabase.from("price_items") as any)
        .insert(toInsert)
        .select();

      if (insertErr) throw insertErr;
      if (data) {
        setItems((prev) => [...prev, ...data]);
      }
      return newItems.length;
    } catch (err: any) {
      setError(err?.message || "Failed to import items from CSV.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Update Company Settings (Labor rate, markup, min margin)
  const updateCompanySettings = async (input: CompanySettingsInput) => {
    setSaving(true);
    setError(null);

    try {
      const updated: CompanySettings = {
        ...settings,
        labor_rate: Number(input.labor_rate),
        markup_percent: Number(input.markup_percent),
        min_margin_percent: Number(input.min_margin_percent),
      };

      if (isMock) {
        setSettings(updated);
        localStorage.setItem("sitequote_company_settings", JSON.stringify(updated));
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user!.id)
        .single();

      const { error: updateErr } = await (supabase.from("companies") as any)
        .update({
          labor_rate: updated.labor_rate,
          markup_percent: updated.markup_percent,
          min_margin_percent: updated.min_margin_percent,
        })
        .eq("id", profile.company_id);

      if (updateErr) throw updateErr;
      setSettings(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to update pricing settings.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Distinct categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered items
  const filteredItems = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((it) => {
      const matchesSearch =
        !q ||
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === "all" || it.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  return {
    items,
    filteredItems,
    categories,
    settings,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    saving,
    error,
    addItem,
    updateItem,
    deleteItem,
    importCsvItems,
    updateCompanySettings,
    refresh: loadData,
  };
}

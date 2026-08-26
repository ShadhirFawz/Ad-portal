"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import type { Category } from "@/types/category";
import {
  Package,
  Car,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Trophy,
  BookOpen,
  Wrench,
  Building2,
  Briefcase,
  Dog,
  Sparkles,
  Apple,
  ChevronRight,
  Check,
  FolderTree,
  X,
  Layers,
  LucideIcon,
  Plug2,
} from "lucide-react";

interface NestedCategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string, category?: Category) => void;
  error?: string;
  disabled?: boolean;
}

// Return a clean single-color monochrome Lucide icon based on category keywords
function getCategoryIcon(name: string, slug?: string): LucideIcon {
  const text = `${name} ${slug || ""}`.toLowerCase();
  if (text.includes("vehic") || text.includes("car") || text.includes("motor") || text.includes("bike")) return Car;
  if (text.includes("elect") || text.includes("phone") || text.includes("comput") || text.includes("laptop") || text.includes("gadget")) return Plug2;
  if (text.includes("fash") || text.includes("cloth") || text.includes("wear") || text.includes("shoe") || text.includes("bag")) return Shirt;
  if (text.includes("home") || text.includes("furnit") || text.includes("garden") || text.includes("appliance")) return HomeIcon;
  if (text.includes("sport") || text.includes("hobb") || text.includes("fit") || text.includes("game")) return Trophy;
  if (text.includes("book") || text.includes("media") || text.includes("music") || text.includes("educa")) return BookOpen;
  if (text.includes("serv") || text.includes("repair") || text.includes("skill")) return Wrench;
  if (text.includes("prop") || text.includes("estate") || text.includes("land") || text.includes("house")) return Building2;
  if (text.includes("job") || text.includes("work") || text.includes("career")) return Briefcase;
  if (text.includes("pet") || text.includes("animal")) return Dog;
  if (text.includes("mob")) return Smartphone;
  if (text.includes("food") || text.includes("agri") || text.includes("grocery")) return Apple;
  if (text.includes("health") || text.includes("beauty") || text.includes("toy") || text.includes("kid")) return Sparkles;
  if (text.includes("pack")) return Package;
  return Package;
}

export default function NestedCategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  error,
  disabled = false,
}: NestedCategorySelectorProps) {
  // Category mapping
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Group categories by parentId
  const childrenMap = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories.forEach((cat) => {
      const pId = cat.parentId || "ROOT";
      if (!map.has(pId)) {
        map.set(pId, []);
      }
      map.get(pId)!.push(cat);
    });

    // Sort categories within groups by displayOrder then name
    map.forEach((list) => {
      list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
    });

    return map;
  }, [categories]);

  // Root / Level 1 Categories
  const level1Categories = useMemo(() => {
    const rootList = childrenMap.get("ROOT") || [];
    if (rootList.length === 0 && categories.length > 0) {
      return categories.filter((c) => !c.parentId || c.level === 0 || !categoryMap.has(c.parentId));
    }
    return rootList;
  }, [childrenMap, categories, categoryMap]);

  // Helper to trace full lineage [Root, Sub, Leaf]
  const getHierarchy = (catId?: string | null): Category[] => {
    if (!catId) return [];
    const chain: Category[] = [];
    let curr = categoryMap.get(catId);
    while (curr) {
      chain.unshift(curr);
      curr = curr.parentId ? categoryMap.get(curr.parentId) : undefined;
    }
    return chain;
  };

  const selectedHierarchy = useMemo(() => {
    return getHierarchy(selectedCategoryId);
  }, [selectedCategoryId, categoryMap]);

  // Internal selection / hover state
  const [isOpen, setIsOpen] = useState(!selectedCategoryId);
  const [hoveredL1, setHoveredL1] = useState<string | null>(null);
  const [hoveredL2, setHoveredL2] = useState<string | null>(null);
  const [hoveredL3, setHoveredL3] = useState<string | null>(null);

  // Sync initial hovered states with selected category hierarchy when opened
  useEffect(() => {
    if (selectedHierarchy.length > 0) {
      if (selectedHierarchy[0]) setHoveredL1(selectedHierarchy[0].id);
      if (selectedHierarchy[1]) setHoveredL2(selectedHierarchy[1].id);
      if (selectedHierarchy[2]) setHoveredL3(selectedHierarchy[2].id);
    } else if (level1Categories.length > 0 && !hoveredL1) {
      setHoveredL1(level1Categories[0].id);
    }
  }, [selectedHierarchy, level1Categories]);

  // Level 2 Categories based on hovered Level 1
  const level2Categories = useMemo(() => {
    if (!hoveredL1) return [];
    return childrenMap.get(hoveredL1) || [];
  }, [hoveredL1, childrenMap]);

  // Level 3 Categories based on hovered Level 2
  const level3Categories = useMemo(() => {
    if (!hoveredL2) return [];
    return childrenMap.get(hoveredL2) || [];
  }, [hoveredL2, childrenMap]);

  // Handle category item click
  const handleItemClick = (category: Category) => {
    if (disabled) return;
    const hasChildren = (childrenMap.get(category.id)?.length ?? 0) > 0;

    // If leaf category or allows direct listing, select it!
    if (!hasChildren || category.allowListings !== false) {
      onSelect(category.id, category);
      setIsOpen(false);
    }
  };

  const selectedCategory = categoryMap.get(selectedCategoryId);
  const SelectedIcon = selectedCategory
    ? getCategoryIcon(selectedCategory.name, selectedCategory.slug)
    : Package;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Category *</span>
        </label>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isOpen ? "Close Category Browser" : "Change Category"}
          </button>
        )}
      </div>

      {/* Selected Category Pill (when selected and collapsed) */}
      {selectedCategory && !isOpen && (
        <div
          onClick={() => !disabled && setIsOpen(true)}
          className={`p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between gap-4 group ${disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              {selectedCategory.iconUrl ? (
                <Image
                  src={selectedCategory.iconUrl}
                  alt={selectedCategory.name}
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <SelectedIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                {selectedHierarchy.map((item, idx) => (
                  <span key={item.id} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                    <span className={idx === selectedHierarchy.length - 1 ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}>
                      {item.name}
                    </span>
                  </span>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedCategory.name}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs group-hover:border-emerald-500 transition-colors">
            Change ▾
          </span>
        </div>
      )}

      {/* Multi-Level Cascading Hover Browser */}
      {isOpen && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/95 shadow-xl overflow-hidden transition-all">
          {/* Breadcrumb Preview Top Bar */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5">
              <span className="flex items-center gap-1 text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Browse:</span>
              </span>
              {hoveredL1 && (
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold shrink-0">
                  <span>{categoryMap.get(hoveredL1)?.name}</span>
                </span>
              )}
              {hoveredL2 && (
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold shrink-0">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{categoryMap.get(hoveredL2)?.name}</span>
                </span>
              )}
              {hoveredL3 && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{categoryMap.get(hoveredL3)?.name}</span>
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline shrink-0 pl-2">
              Hover to expand nested subcategories
            </span>
          </div>

          {/* Cascading Columns Container */}
          <div className="flex flex-col sm:flex-row overflow-x-auto custom-scrollbar divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 min-h-75 max-h-95">
            {/* Column 1: Parent / Level 1 */}
            <div className="w-full sm:w-1/3 min-w-55 overflow-y-auto custom-scrollbar p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Primary Category
              </div>

              {level1Categories.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 text-center">No categories found</div>
              ) : (
                level1Categories.map((cat) => {
                  const isHovered = hoveredL1 === cat.id;
                  const isSelected = selectedCategoryId === cat.id;
                  const hasSub = (childrenMap.get(cat.id)?.length ?? 0) > 0;
                  const Icon = getCategoryIcon(cat.name, cat.slug);

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => {
                        setHoveredL1(cat.id);
                        setHoveredL2(null);
                        setHoveredL3(null);
                      }}
                      onClick={() => {
                        setHoveredL1(cat.id);
                        handleItemClick(cat);
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer select-none ${isHovered || isSelected
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center">
                          {cat.iconUrl ? (
                            <Image src={cat.iconUrl} alt={cat.name} width={16} height={16} className="w-4 h-4 object-contain inline" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </div>

                      {hasSub ? (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Select
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Column 2: Subcategories / Level 2 */}
            {level2Categories.length > 0 && (
              <div className="w-full sm:w-1/3 min-w-55 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-slate-50/40 dark:bg-slate-900/40 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Subcategory
                </div>

                {level2Categories.map((cat) => {
                  const isHovered = hoveredL2 === cat.id;
                  const isSelected = selectedCategoryId === cat.id;
                  const hasSub = (childrenMap.get(cat.id)?.length ?? 0) > 0;

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => {
                        setHoveredL2(cat.id);
                        setHoveredL3(null);
                      }}
                      onClick={() => {
                        setHoveredL2(cat.id);
                        handleItemClick(cat);
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer select-none ${isHovered || isSelected
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <span className="truncate">{cat.name}</span>

                      {hasSub ? (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Select
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column 3: Leaf / Nested Subcategories (Level 3) */}
            {level3Categories.length > 0 && (
              <div className="w-full sm:w-1/3 min-w-55 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-slate-100/40 dark:bg-slate-800/30 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Specific Type
                </div>

                {level3Categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredL3(cat.id)}
                      onClick={() => handleItemClick(cat)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer select-none ${isSelected
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-500"
                        : "text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        <span>Select</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom helper prompt */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {selectedCategoryId ? (
                <>Selected: <strong className="text-slate-800 dark:text-slate-200">{categoryMap.get(selectedCategoryId)?.name}</strong></>
              ) : (
                "Click on any category or subcategory to select it for your listing"
              )}
            </span>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

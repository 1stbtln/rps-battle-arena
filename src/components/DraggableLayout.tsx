import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Settings,
  X,
  Maximize2,
  Minimize2,
  Move,
  Save,
  Undo,
  Download,
  Upload,
  Layout,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

// Make the GridLayout responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
}

interface Module {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  icon?: React.ReactNode;
  description?: string;
}

export interface DraggableLayoutProps {
  modules: Module[];
  onLayoutChange?: (layout: LayoutItem[]) => void;
  className?: string;
  isEditMode?: boolean;
  toggleEditMode?: () => void;
}

export const DraggableLayout: React.FC<DraggableLayoutProps> = ({
  modules,
  onLayoutChange,
  className = "",
  isEditMode = false,
  toggleEditMode,
}) => {
  const { saveLayout, loadLayout } = useGameStore();
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutItem[] }>({
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  });
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [minimizedModules, setMinimizedModules] = useState<string[]>([]);
  const [savedLayouts, setSavedLayouts] = useState<
    { name: string; layout: { [key: string]: LayoutItem[] } }[]
  >([]);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [currentLayoutName, setCurrentLayoutName] = useState("Default");
  const [newLayoutName, setNewLayoutName] = useState("");
  const [userTheme, setUserTheme] = useState<
    "dark" | "light" | "cyber" | "neon"
  >("cyber");

  // Initialize layouts based on modules
  useEffect(() => {
    // Try to load saved layout
    const savedLayout = loadLayout();

    if (savedLayout && Object.keys(savedLayout).length > 0) {
      setLayouts(savedLayout);

      // Extract active modules from saved layout
      const activeIds = savedLayout.lg.map((item) => item.i);
      setActiveModules(activeIds);
    } else {
      // Create default layout
      const defaultLayout = modules.map((module, index) => ({
        i: module.id,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        w: module.defaultSize.w,
        h: module.defaultSize.h,
        minW: module.minSize?.w || 2,
        minH: module.minSize?.h || 2,
        maxW: module.maxSize?.w,
        maxH: module.maxSize?.h,
        isDraggable: true,
        isResizable: true,
      }));

      setLayouts({
        lg: defaultLayout,
        md: defaultLayout.map((item) => ({ ...item, w: Math.min(item.w, 6) })),
        sm: defaultLayout.map((item) => ({
          ...item,
          w: Math.min(item.w, 4),
          x: 0,
          y: item.y * 2,
        })),
        xs: defaultLayout.map((item) => ({
          ...item,
          w: 12,
          x: 0,
          y: item.y * 2,
        })),
        xxs: defaultLayout.map((item) => ({
          ...item,
          w: 12,
          x: 0,
          y: item.y * 2,
        })),
      });

      setActiveModules(modules.map((m) => m.id));
    }

    // Load saved layouts from localStorage
    try {
      const savedLayoutsList = localStorage.getItem("rps-battle-saved-layouts");
      if (savedLayoutsList) {
        setSavedLayouts(JSON.parse(savedLayoutsList));
      }
    } catch (error) {
      console.error("Failed to load saved layouts:", error);
    }
  }, [modules, loadLayout]);

  const handleLayoutChange = (
    currentLayout: LayoutItem[],
    allLayouts: { [key: string]: LayoutItem[] }
  ) => {
    setLayouts(allLayouts);
    if (onLayoutChange) {
      onLayoutChange(currentLayout);
    }

    // Save layout to store/localStorage
    saveLayout(allLayouts);
  };

  const toggleModuleVisibility = (moduleId: string) => {
    if (activeModules.includes(moduleId)) {
      setActiveModules(activeModules.filter((id) => id !== moduleId));
    } else {
      // Find the module to add
      const moduleToAdd = modules.find((m) => m.id === moduleId);
      if (moduleToAdd) {
        // Find a position for the new module
        const newLayout = [...layouts.lg];

        // Calculate the new position
        const lastItem = newLayout[newLayout.length - 1];
        const newItem = {
          i: moduleId,
          x: lastItem ? (lastItem.x + lastItem.w) % 12 : 0,
          y: lastItem
            ? lastItem.y + (lastItem.x + lastItem.w >= 12 ? 1 : 0) * lastItem.h
            : 0,
          w: moduleToAdd.defaultSize.w,
          h: moduleToAdd.defaultSize.h,
          minW: moduleToAdd.minSize?.w || 2,
          minH: moduleToAdd.minSize?.h || 2,
        };

        // Add to layout
        newLayout.push(newItem);
        const updatedLayouts = {
          ...layouts,
          lg: newLayout,
        };
        setLayouts(updatedLayouts);
        saveLayout(updatedLayouts);

        setActiveModules([...activeModules, moduleId]);
      }
    }
  };

  const toggleMinimize = (moduleId: string) => {
    if (minimizedModules.includes(moduleId)) {
      setMinimizedModules(minimizedModules.filter((id) => id !== moduleId));
    } else {
      setMinimizedModules([...minimizedModules, moduleId]);
    }
  };

  const removeModule = (moduleId: string) => {
    setActiveModules(activeModules.filter((id) => id !== moduleId));

    // Remove from layouts
    const updatedLayouts = {
      lg: layouts.lg.filter((item) => item.i !== moduleId),
      md: layouts.md.filter((item) => item.i !== moduleId),
      sm: layouts.sm.filter((item) => item.i !== moduleId),
      xs: layouts.xs.filter((item) => item.i !== moduleId),
      xxs: layouts.xxs.filter((item) => item.i !== moduleId),
    };

    setLayouts(updatedLayouts);
    saveLayout(updatedLayouts);
  };

  const saveCurrentLayout = () => {
    if (!newLayoutName.trim()) return;

    const newSavedLayouts = [
      ...savedLayouts,
      { name: newLayoutName, layout: layouts },
    ];

    setSavedLayouts(newSavedLayouts);
    setCurrentLayoutName(newLayoutName);
    setNewLayoutName("");

    // Save to localStorage
    try {
      localStorage.setItem(
        "rps-battle-saved-layouts",
        JSON.stringify(newSavedLayouts)
      );
    } catch (error) {
      console.error("Failed to save layouts to localStorage:", error);
    }
  };

  const loadSavedLayout = (index: number) => {
    const layoutToLoad = savedLayouts[index];
    if (layoutToLoad) {
      setLayouts(layoutToLoad.layout);
      saveLayout(layoutToLoad.layout);
      setCurrentLayoutName(layoutToLoad.name);

      // Extract active modules from saved layout
      const activeIds = layoutToLoad.layout.lg.map((item) => item.i);
      setActiveModules(activeIds);
    }
  };

  const exportLayout = () => {
    const dataToExport = {
      layouts,
      activeModules,
      minimizedModules,
      name: currentLayoutName,
    };

    const dataStr = JSON.stringify(dataToExport);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `rps-layout-${currentLayoutName
      .toLowerCase()
      .replace(/\s+/g, "-")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);

        if (importedData.layouts && importedData.activeModules) {
          setLayouts(importedData.layouts);
          saveLayout(importedData.layouts);
          setActiveModules(importedData.activeModules);

          if (importedData.minimizedModules) {
            setMinimizedModules(importedData.minimizedModules);
          }

          if (importedData.name) {
            setCurrentLayoutName(importedData.name);
          }
        }
      } catch (error) {
        console.error("Error importing layout:", error);
        alert("Failed to import layout. The file may be corrupted.");
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaultLayout = () => {
    // Create default layout
    const defaultLayout = modules.map((module, index) => ({
      i: module.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: module.defaultSize.w,
      h: module.defaultSize.h,
      minW: module.minSize?.w || 2,
      minH: module.minSize?.h || 2,
      maxW: module.maxSize?.w,
      maxH: module.maxSize?.h,
      isDraggable: true,
      isResizable: true,
    }));

    const newLayouts = {
      lg: defaultLayout,
      md: defaultLayout.map((item) => ({ ...item, w: Math.min(item.w, 6) })),
      sm: defaultLayout.map((item) => ({
        ...item,
        w: Math.min(item.w, 4),
        x: 0,
        y: item.y * 2,
      })),
      xs: defaultLayout.map((item) => ({
        ...item,
        w: 12,
        x: 0,
        y: item.y * 2,
      })),
      xxs: defaultLayout.map((item) => ({
        ...item,
        w: 12,
        x: 0,
        y: item.y * 2,
      })),
    };

    setLayouts(newLayouts);
    saveLayout(newLayouts);
    setActiveModules(modules.map((m) => m.id));
    setMinimizedModules([]);
    setCurrentLayoutName("Default");
  };
  const changeTheme = (theme: "dark" | "light" | "cyber" | "neon") => {
    setUserTheme(theme);
    // You could also save this to localStorage or your store
    document.documentElement.setAttribute("data-theme", theme);

    // Save theme preference to localStorage
    localStorage.setItem("rps-battle-theme", theme);
  };

  // Filter active modules
  const filteredModules = modules.filter((module) =>
    activeModules.includes(module.id)
  );

  return (
    <div className={`draggable-layout ${className} theme-${userTheme}`}>
      {isEditMode && (
        <motion.div
          className="layout-editor-toolbar mb-6 p-4 bg-black/40 backdrop-blur-md rounded-lg border border-white/20 flex flex-col gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-full flex justify-between items-center">
            <h3 className="text-lg font-bold">Customize Layout</h3>
            <motion.button
              className="text-white/70 hover:text-white"
              onClick={toggleEditMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <motion.button
              className="tool-button"
              onClick={() => setShowLayoutSelector(!showLayoutSelector)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Layout size={16} />
              <span>Layouts</span>
            </motion.button>

            <motion.button
              className="tool-button"
              onClick={resetToDefaultLayout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Undo size={16} />
              <span>Reset</span>
            </motion.button>

            <motion.button
              className="tool-button"
              onClick={exportLayout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              <span>Export</span>
            </motion.button>

            <label className="tool-button cursor-pointer">
              <Upload size={16} />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importLayout}
              />
            </label>
          </div>

          {/* Theme selector */}
          <div className="theme-selector mb-4">
            <h4 className="text-sm font-semibold mb-2">Choose Theme</h4>
            <div className="flex flex-wrap gap-2">
              <motion.button
                className={`px-3 py-2 rounded-md text-xs font-medium ${
                  userTheme === "dark"
                    ? "bg-gray-700 border border-gray-500"
                    : "bg-white/10 border border-white/20"
                }`}
                onClick={() => changeTheme("dark")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dark
              </motion.button>
              <motion.button
                className={`px-3 py-2 rounded-md text-xs font-medium ${
                  userTheme === "light"
                    ? "bg-white border border-gray-300 text-gray-800"
                    : "bg-white/10 border border-white/20"
                }`}
                onClick={() => changeTheme("light")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Light
              </motion.button>
              <motion.button
                className={`px-3 py-2 rounded-md text-xs font-medium ${
                  userTheme === "cyber"
                    ? "bg-cyan-900/50 border border-cyan-500"
                    : "bg-white/10 border border-white/20"
                }`}
                onClick={() => changeTheme("cyber")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cyber
              </motion.button>
              <motion.button
                className={`px-3 py-2 rounded-md text-xs font-medium ${
                  userTheme === "neon"
                    ? "bg-pink-900/50 border border-pink-500"
                    : "bg-white/10 border border-white/20"
                }`}
                onClick={() => changeTheme("neon")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Neon
              </motion.button>
            </div>
          </div>

          {showLayoutSelector && (
            <motion.div
              className="layout-selector p-3 bg-black/30 rounded-lg border border-white/10 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <h4 className="text-sm font-semibold mb-2">Saved Layouts</h4>

              <div className="saved-layouts-list mb-3 max-h-32 overflow-y-auto">
                {savedLayouts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {savedLayouts.map((layout, index) => (
                      <motion.button
                        key={index}
                        className={`px-3 py-2 text-xs rounded border ${
                          currentLayoutName === layout.name
                            ? "bg-blue-500/30 border-blue-500"
                            : "bg-white/10 border-white/20 hover:bg-white/20"
                        }`}
                        onClick={() => loadSavedLayout(index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {layout.name}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    No saved layouts yet
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  placeholder="New layout name"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm"
                />
                <motion.button
                  className="px-3 py-2 bg-blue-500/80 hover:bg-blue-500 rounded text-sm flex items-center gap-1"
                  onClick={saveCurrentLayout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!newLayoutName.trim()}
                >
                  <Save size={14} />
                  <span>Save</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-2">Available Modules</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {modules.map((module) => (
                <motion.button
                  key={module.id}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeModules.includes(module.id)
                      ? "bg-blue-500/30 border border-blue-500"
                      : "bg-white/10 border border-white/20 hover:bg-white/20"
                  }`}
                  onClick={() => toggleModuleVisibility(module.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeModules.includes(module.id) ? (
                    <Eye size={14} />
                  ) : (
                    <EyeOff size={14} />
                  )}
                  <span className="truncate">{module.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <ResponsiveGridLayout
        className={`layout ${isEditMode ? "edit-mode" : ""}`}
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        margin={[12, 12]}
        containerPadding={[0, 0]}
      >
        {filteredModules.map((module) => (
          <div key={module.id} className="module-container">
            <motion.div
              className={`module-content h-full overflow-hidden rounded-lg border transition-colors
                ${
                  userTheme === "cyber"
                    ? "bg-black/40 backdrop-blur-sm border-cyan-500/40 cyber-glow"
                    : userTheme === "neon"
                    ? "bg-black/60 backdrop-blur-sm border-pink-500/40 neon-glow"
                    : userTheme === "light"
                    ? "bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg text-gray-800"
                    : "bg-black/40 backdrop-blur-sm border-white/20"
                }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`module-header flex items-center justify-between p-2 border-b 
                ${
                  userTheme === "cyber"
                    ? "border-cyan-500/30 bg-black/50"
                    : userTheme === "neon"
                    ? "border-pink-500/30 bg-black/60"
                    : userTheme === "light"
                    ? "border-gray-200 bg-gray-100"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <h3 className="text-sm font-medium truncate flex items-center gap-2">
                  {isEditMode && <Move size={14} className="text-gray-400" />}
                  {module.title}
                </h3>
                <div className="flex items-center gap-1">
                  {isEditMode && (
                    <motion.button
                      className="p-1 text-white/70 hover:text-white"
                      onClick={() => removeModule(module.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                  <motion.button
                    className="p-1 text-white/70 hover:text-white"
                    onClick={() => toggleMinimize(module.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {minimizedModules.includes(module.id) ? (
                      <Maximize2 size={14} />
                    ) : (
                      <Minimize2 size={14} />
                    )}
                  </motion.button>
                </div>
              </div>
              <div
                className={`module-body p-3 h-[calc(100%-2.5rem)] overflow-auto 
                ${minimizedModules.includes(module.id) ? "hidden" : ""}
                ${userTheme === "light" ? "text-gray-800" : "text-white"}
              `}
              >
                {module.component}
              </div>
            </motion.div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

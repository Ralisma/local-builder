import React, { useMemo, useState, useEffect } from "react";
// Import Puck core components and types
import { Puck, type Config, type Data, DropZone } from "@puckeditor/core";

/**
 * Direct path to distribution CSS.
 * Using the direct dist path ensures that the styles are correctly loaded
 * in environments that may have issues with package export maps.
 */
import "@puckeditor/core/dist/index.css";

// Utilities for project generation and file saving
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Lock, Unlock, ChevronDown, Monitor, Download, Layout, Settings, Layers } from "lucide-react";

// --- Shadcn UI Mock Components (to ensure local-builder functionality) ---
// Note: In your local environment, ensure you have run the shadcn add commands for:
// accordion, alert, badge, button, card, input, label, progress, separator
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// --- 1. CONFIGURATION LOGIC ---

type Props = {
  Section: { 
    columns: number; 
    gap: number; 
    paddingY: number; 
    bgColor: string;
    sectionTitle: string;
  };
  Button: { text: string; variant: "default" | "destructive" | "outline" | "secondary"; size: "default" | "sm" | "lg" };
  Badge: { text: string; variant: "default" | "secondary" | "outline" };
  Card: { title: string; description: string; content: string; footer: string };
  Accordion: { items: { title: string; content: string }[] };
  Input: { type: string; placeholder: string; label: string };
  Alert: { title: string; description: string; variant: "default" | "destructive" };
  Progress: { value: number; label: string };
  Separator: { orientation: "horizontal" | "vertical" };
};

type RootProps = {
  canvasColor: string;
  maxWidth: string;
};

const config: Config<Props, RootProps> = {
  root: {
    fields: {
      canvasColor: { type: "text", label: "Canvas Background" },
      maxWidth: { 
        type: "select", 
        label: "Max Width",
        options: [
          { label: "Standard (1200px)", value: "max-w-6xl" },
          { label: "Wide (1500px)", value: "max-w-7xl" },
          { label: "Full Width", value: "max-w-full" }
        ]
      }
    },
    defaultProps: {
      canvasColor: "#ffffff",
      maxWidth: "max-w-6xl"
    },
    render: ({ children, canvasColor, maxWidth }) => (
      <div className="min-h-screen w-full transition-all duration-500 ease-in-out" style={{ backgroundColor: canvasColor }}>
        <div className={`mx-auto p-8 space-y-0 ${maxWidth}`}>
          {children}
        </div>
      </div>
    ),
  },
  categories: {
    Structure: { components: ["Section"] },
    Layout: { components: ["Card", "Separator", "Accordion"] },
    Forms: { components: ["Button", "Input"] },
    Display: { components: ["Badge", "Progress"] },
    Feedback: { components: ["Alert"] },
  },
  components: {
    Section: {
      fields: {
        sectionTitle: { type: "text", label: "Section Title" },
        columns: { type: "number", label: "Cols (1-6)" },
        gap: { type: "number", label: "Gap (px)" },
        paddingY: { type: "number", label: "Vertical Padding" },
        bgColor: { type: "text", label: "BG Color" }
      },
      defaultProps: {
        sectionTitle: "New Section",
        columns: 1,
        gap: 24,
        paddingY: 64,
        bgColor: "transparent",
      },
      render: ({ columns, gap, paddingY, bgColor, sectionTitle }) => (
        <section 
          className="relative border border-dashed border-gray-200 transition-all hover:border-gray-300"
          style={{ 
            backgroundColor: bgColor,
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            paddingLeft: '24px',
            paddingRight: '24px'
          }}
        >
          <div className="absolute -top-3 left-6 z-10">
             <span className="bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
               {sectionTitle}
             </span>
          </div>
          <div 
            className="grid w-full" 
            style={{ 
              gridTemplateColumns: `repeat(${columns || 1}, minmax(0, 1fr))`,
              gap: `${gap || 16}px`
            }}
          >
            <DropZone zone="section-content" />
          </div>
        </section>
      ),
    },
    Card: {
      render: ({ title, description, content, footer }) => (
        <Card className="w-full h-full border-none shadow-md">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
          {footer && <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>}
        </Card>
      ),
      defaultProps: { title: "Title", description: "Subtitle", content: "Main body text...", footer: "" },
      fields: { title: { type: "text" }, description: { type: "text" }, content: { type: "textarea" }, footer: { type: "text" } },
    },
    Button: {
      render: ({ text, variant, size }) => <Button variant={variant} size={size} className="w-full shadow-sm">{text}</Button>,
      defaultProps: { text: "Action Button", variant: "default", size: "default" },
      fields: { 
        text: { type: "text" }, 
        variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }, { label: "Outline", value: "outline" }, { label: "Secondary", value: "secondary" }] },
        size: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Small", value: "sm" }, { label: "Large", value: "lg" }] }
      },
    },
    Input: {
      render: ({ placeholder, label, type }) => (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-tight">{label}</Label>
          <Input type={type} placeholder={placeholder} className="bg-white border-gray-200" />
        </div>
      ),
      defaultProps: { placeholder: "name@example.com", label: "Email", type: "email" },
      fields: { label: { type: "text" }, placeholder: { type: "text" }, type: { type: "select", options: [{ label: "Text", value: "text" }, { label: "Email", value: "email" }] } }
    },
    Accordion: {
      render: ({ items }) => (
        <Accordion type="single" collapsible className="w-full bg-white rounded-lg px-4 border border-gray-100">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm">{item.title}</AccordionTrigger>
              <AccordionContent className="text-gray-600">{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ),
      defaultProps: { items: [{ title: "Helpful Tip", content: "Detailed info here." }] },
      fields: { items: { type: "array", arrayFields: { title: { type: "text" }, content: { type: "textarea" } } } },
    },
    Separator: {
      render: ({ orientation }) => <Separator orientation={orientation} className="bg-gray-100" />,
      defaultProps: { orientation: "horizontal" },
      fields: { orientation: { type: "select", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] } },
    },
    Badge: {
      render: ({ text, variant }) => <Badge variant={variant}>{text}</Badge>,
      defaultProps: { text: "Badge", variant: "default" },
      fields: { text: { type: "text" }, variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Secondary", value: "secondary" }, { label: "Outline", value: "outline" }] } },
    },
    Alert: {
      render: ({ title, description, variant }) => (
        <Alert variant={variant} className="bg-white">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-bold">{title}</AlertTitle>
          <AlertDescription className="text-xs">{description}</AlertDescription>
        </Alert>
      ),
      defaultProps: { title: "Heads up!", description: "Add a description.", variant: "default" },
      fields: { title: { type: "text" }, description: { type: "text" }, variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }] } }
    },
    Progress: {
      render: ({ value, label }) => (
        <div className="w-full space-y-2">
          <Label className="text-[10px] uppercase font-bold text-gray-400">{label}</Label>
          <Progress value={value} className="h-1.5" />
        </div>
      ),
      defaultProps: { value: 50, label: "Setup Progress" },
      fields: { value: { type: "number" }, label: { type: "text" } }
    }
  },
};

// --- 2. GENERATOR LOGIC ---
const COMPONENT_MAP: Record<string, { path: string; imports: string[]; cli: string; }> = {
  Section: { path: "", imports: [], cli: "" },
  Card: { path: "@/components/ui/card", imports: ["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter"], cli: "card" },
  Button: { path: "@/components/ui/button", imports: ["Button"], cli: "button" },
  Input: { path: "@/components/ui/input", imports: ["Input"], cli: "input" },
  Label: { path: "@/components/ui/label", imports: ["Label"], cli: "label" },
  Accordion: { path: "@/components/ui/accordion", imports: ["Accordion", "AccordionContent", "AccordionItem", "AccordionTrigger"], cli: "accordion" },
  Separator: { path: "@/components/ui/separator", imports: ["Separator"], cli: "separator" },
  Badge: { path: "@/components/ui/badge", imports: ["Badge"], cli: "badge" },
  Alert: { path: "@/components/ui/alert", imports: ["Alert", "AlertDescription", "AlertTitle"], cli: "alert" },
  Progress: { path: "@/components/ui/progress", imports: ["Progress"], cli: "progress" },
};

const generateJSX = (item: any, data: Data): string => {
  const { type, props } = item;
  switch (type) {
    case "Section": {
      const zoneKey = `${item.readOnly?.puckId}:section-content`;
      const zoneItems = data.zones?.[zoneKey] || [];
      const zoneContent = zoneItems.map(zi => generateJSX(zi, data)).join("\n        ");
      return `
      <section 
        style={{ 
          backgroundColor: '${props.bgColor}', 
          paddingTop: '${props.paddingY}px', 
          paddingBottom: '${props.paddingY}px' 
        }}
      >
        <div 
          className="grid w-full px-6" 
          style={{ 
            gridTemplateColumns: 'repeat(${props.columns}, minmax(0, 1fr))', 
            gap: '${props.gap}px' 
          }}
        >
          ${zoneContent}
        </div>
      </section>`;
    }
    case "Card": return `<Card><CardHeader><CardTitle>${props.title}</CardTitle><CardDescription>${props.description}</CardDescription></CardHeader><CardContent>${props.content}</CardContent>${props.footer ? `<CardFooter>${props.footer}</CardFooter>` : ""}</Card>`;
    case "Button": return `<Button variant="${props.variant}" size="${props.size}">${props.text}</Button>`;
    case "Badge": return `<Badge variant="${props.variant}">${props.text}</Badge>`;
    case "Separator": return `<Separator orientation="${props.orientation}" />`;
    case "Alert": return `<Alert variant="${props.variant}"><AlertCircle className="h-4 w-4" /><AlertTitle>${props.title}</AlertTitle><AlertDescription>${props.description}</AlertDescription></Alert>`;
    case "Progress": return `<div className="w-full space-y-2"><Label>${props.label}</Label><Progress value={${props.value}} /></div>`;
    case "Input": return `<div className="space-y-2"><Label>${props.label}</Label><Input type="${props.type}" placeholder="${props.placeholder}" /></div>`;
    case "Accordion": return `<Accordion type="single" collapsible>${props.items?.map((it: any, i: number) => `<AccordionItem value="item-${i}"><AccordionTrigger>${it.title}</AccordionTrigger><AccordionContent>${it.content}</AccordionContent></AccordionItem>`).join("")}</Accordion>`;
    default: return "";
  }
};

async function saveProject(pages: { path: string; name: string; data: Data }[], rootProps: RootProps) {
  const zip = new JSZip();
  const allUsedComponents = new Set<string>();

  pages.forEach((page) => {
    const usedOnPage = new Set<string>();
    const findUsed = (items: any[]) => {
      items.forEach(i => {
        usedOnPage.add(i.type);
        if (["Input", "Progress"].includes(i.type)) usedOnPage.add("Label");
        const puckId = i.readOnly?.puckId;
        if (puckId && page.data.zones) {
          Object.keys(page.data.zones).forEach(key => {
            if (key.startsWith(puckId)) findUsed(page.data.zones![key] || []);
          });
        }
      });
    };
    findUsed(page.data.content);
    
    const importStr = Array.from(usedOnPage)
      .map(t => COMPONENT_MAP[t] && COMPONENT_MAP[t].path ? `import { ${COMPONENT_MAP[t].imports.join(", ")} } from "${COMPONENT_MAP[t].path}";` : "")
      .filter(Boolean)
      .join("\n");
      
    const jsx = page.data.content.map(i => generateJSX(i, page.data)).join("\n      ");
    
    const code = `
import React from 'react';
import { AlertCircle } from "lucide-react";
${importStr}

export default function ${page.name}() {
  return (
    <div className="min-h-screen w-full transition-all" style={{ backgroundColor: '${rootProps.canvasColor}' }}>
      <div className="mx-auto ${rootProps.maxWidth}">
        ${jsx}
      </div>
    </div>
  );
}`;
    zip.folder("src")?.folder("pages")?.file(`${page.name}.tsx`, code.trim());
    usedOnPage.forEach(u => allUsedComponents.add(u));
  });

  const cliCommand = `npx shadcn@latest add ${Array.from(allUsedComponents).map(c => COMPONENT_MAP[c]?.cli).filter(Boolean).join(" ")}`;
  zip.file("README.md", `# Generated Site\n\nRun this to install dependencies:\n\`\`\`bash\n${cliCommand}\n\`\`\``);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "project-export.zip");
}

// --- 3. MAIN UI COMPONENT ---
export default function App() {
  const [uiLocked, setUiLocked] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const initialData = useMemo(() => ({ 
    content: [], 
    root: { props: { canvasColor: "#ffffff", maxWidth: "max-w-6xl" } }, 
    zones: {} 
  }), []);

  // Close dropdown on click outside
  useEffect(() => {
    const close = () => setShowDropdown(false);
    if (showDropdown) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [showDropdown]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden font-sans">
      {/* Dynamic Styles for Hover-to-Show Sidebars */}
      <style>{`
        /* Target internal Puck Sidebar Classes */
        ${!uiLocked ? `
          [class*="Puck-Sidebar"] {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
            opacity: 0.05;
            z-index: 200 !important;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          }
          /* Left Sidebar Hide */
          [class*="Puck-Sidebar"]:first-of-type {
            transform: translateX(-98%);
            border-right: 4px solid #f3f4f6 !important;
          }
          /* Right Sidebar Hide */
          [class*="Puck-Sidebar"]:last-of-type {
            transform: translateX(98%);
            border-left: 4px solid #f3f4f6 !important;
          }
          /* Hover Zone Triggers */
          [class*="Puck-Sidebar"]:first-of-type:hover {
            transform: translateX(0);
            opacity: 1;
            border-right-width: 1px !important;
          }
          [class*="Puck-Sidebar"]:last-of-type:hover {
            transform: translateX(0);
            opacity: 1;
            border-left-width: 1px !important;
          }
          /* Expand Canvas when sidebars are hidden */
          [class*="Puck-Canvas"] {
            margin: 0 !important;
            width: 100% !important;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        ` : ''}

        /* Customize scrollbars for a cleaner look */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Top Settings Header */}
      <header className="h-[48px] w-full border-bottom border-gray-100 flex items-center justify-between px-4 z-[400] bg-white relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center">
              <Monitor size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">Shadcn Maker</span>
          </div>

          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
              className={`flex items-center gap-2 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-all border ${
                uiLocked 
                  ? "bg-zinc-50 border-zinc-200 text-zinc-600" 
                  : "bg-blue-50 border-blue-100 text-blue-600"
              }`}
            >
              {uiLocked ? <Lock size={12} /> : <Unlock size={12} />}
              UI Layout: {uiLocked ? "Locked" : "Dynamic"}
              <ChevronDown size={12} className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 left-0 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Workspace Controls</div>
                <button 
                  onClick={() => { setUiLocked(true); setShowDropdown(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${uiLocked ? "bg-zinc-50 text-zinc-900" : "hover:bg-gray-50 text-gray-600"}`}
                >
                  <div className={`p-1 rounded ${uiLocked ? "bg-zinc-200" : "bg-gray-100"}`}><Lock size={14} /></div>
                  <div className="text-left">
                    <div className="font-bold leading-tight">Fixed UI</div>
                    <div className="text-[10px] text-gray-500">Sidebars always visible</div>
                  </div>
                </button>
                <button 
                  onClick={() => { setUiLocked(false); setShowDropdown(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${!uiLocked ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"}`}
                >
                  <div className={`p-1 rounded ${!uiLocked ? "bg-blue-200 text-blue-700" : "bg-gray-100"}`}><Unlock size={14} /></div>
                  <div className="text-left">
                    <div className="font-bold leading-tight">Hover Mode</div>
                    <div className="text-[10px] text-gray-400">Hidden until mouse near edges</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border-r pr-3 mr-1">
             <Settings size={12} /> Config
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border-r pr-3 mr-1">
             <Layers size={12} /> Layers
           </div>
           <div className="text-[11px] font-medium italic text-gray-300 pr-2">
             v1.2.0 stable
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 relative overflow-hidden bg-gray-50">
        <Puck
          config={config}
          data={initialData}
          onPublish={async (data) => {
            try {
              await saveProject([{ path: "/", name: "Home", data }], data.root.props as RootProps);
            } catch (error) {
              console.error("Project export failed:", error);
            }
          }}
        />
      </main>

      {/* Fixed Watermark - Bottom Right
          Positioned here to avoid any interaction with the left sidebar or the right settings panel.
      */}
      <div className="fixed bottom-6 right-6 z-[500] pointer-events-none group">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white shadow-xl transform transition-transform duration-300 hover:scale-105">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">
             website builder using vite & shadcn by Ral
           </span>
        </div>
      </div>
    </div>
  );
}
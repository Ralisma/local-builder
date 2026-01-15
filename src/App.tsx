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
import { Lock, Unlock, ChevronDown, Monitor, Download, Layout, Settings, Layers, File, Plus, Trash2, ChevronRight } from "lucide-react";

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
  Button: { 
    text: string; 
    variant: "default" | "destructive" | "outline" | "secondary"; 
    size: "default" | "sm" | "lg";
    actionType: "none" | "link" | "alert";
    actionTarget: string;
  };
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
  pageTitle: string;
  pageRoute: string;
};

const config: Config<Props, RootProps> = {
  root: {
    fields: {
      pageTitle: { type: "text", label: "Page Title" },
      pageRoute: { type: "text", label: "Page Route (e.g. /about)" },
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
      pageTitle: "Home",
      pageRoute: "/",
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
    Pages: { components: [] } // Added Pages category placeholder
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
            {Array.from({ length: columns || 1 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <DropZone zone={`col-${i}`} />
              </div>
            ))}
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
      render: ({ text, variant, size, actionType, actionTarget }) => (
        <Button 
          variant={variant} 
          size={size} 
          className="w-full shadow-sm"
          onClick={() => {
            if (actionType === "link" && actionTarget) {
              window.location.href = actionTarget;
            } else if (actionType === "alert" && actionTarget) {
              alert(actionTarget);
            }
          }}
        >
          {text}
        </Button>
      ),
      defaultProps: { 
        text: "Action Button", 
        variant: "default", 
        size: "default",
        actionType: "none",
        actionTarget: ""
      },
      fields: { 
        text: { type: "text" }, 
        variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }, { label: "Outline", value: "outline" }, { label: "Secondary", value: "secondary" }] },
        size: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Small", value: "sm" }, { label: "Large", value: "lg" }] },
        actionType: { type: "radio", options: [{ label: "None", value: "none" }, { label: "Link", value: "link" }, { label: "Pop-up Alert", value: "alert" }] },
        actionTarget: { type: "text", label: "Target URL or Message" }
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
      // Need to iterate through columns to get content for each zone
      const colCount = props.columns || 1;
      const columnsJSX = Array.from({ length: colCount }).map((_, i) => {
        const zoneKey = `${item.readOnly?.puckId}:col-${i}`;
        const zoneItems = data.zones?.[zoneKey] || [];
        const zoneContent = zoneItems.map(zi => generateJSX(zi, data)).join("\n          ");
        return `
        <div className="flex flex-col gap-4">
          ${zoneContent}
        </div>`;
      }).join("\n");

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
          ${columnsJSX}
        </div>
      </section>`;
    }
    case "Card": return `<Card><CardHeader><CardTitle>${props.title}</CardTitle><CardDescription>${props.description}</CardDescription></CardHeader><CardContent>${props.content}</CardContent>${props.footer ? `<CardFooter>${props.footer}</CardFooter>` : ""}</Card>`;
    case "Button": {
      let onClick = "";
      if (props.actionType === "link" && props.actionTarget) onClick = ` onClick={() => window.location.href = "${props.actionTarget}"}`;
      if (props.actionType === "alert" && props.actionTarget) onClick = ` onClick={() => alert("${props.actionTarget}")}`;
      return `<Button variant="${props.variant}" size="${props.size}"${onClick}>${props.text}</Button>`;
    }
    case "Badge": return `<Badge variant="${props.variant}">${props.text}</Badge>`;
    case "Separator": return `<Separator orientation="${props.orientation}" />`;
    case "Alert": return `<Alert variant="${props.variant}"><AlertCircle className="h-4 w-4" /><AlertTitle>${props.title}</AlertTitle><AlertDescription>${props.description}</AlertDescription></Alert>`;
    case "Progress": return `<div className="w-full space-y-2"><Label>${props.label}</Label><Progress value={${props.value}} /></div>`;
    case "Input": return `<div className="space-y-2"><Label>${props.label}</Label><Input type="${props.type}" placeholder="${props.placeholder}" /></div>`;
    case "Accordion": return `<Accordion type="single" collapsible>${props.items?.map((it: any, i: number) => `<AccordionItem value="item-${i}"><AccordionTrigger>${it.title}</AccordionTrigger><AccordionContent>${it.content}</AccordionContent></AccordionItem>`).join("")}</Accordion>`;
    default: return "";
  }
};

// Data structure for a page
interface Page {
  id: string;
  data: Data;
}

async function saveProject(pages: Page[], rootProps: RootProps) {
  const zip = new JSZip();
  const allUsedComponents = new Set<string>();

  pages.forEach((page) => {
    const pageProps = page.data.root.props as RootProps;
    const pageName = pageProps.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "untitled";
    
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

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}() {
  return (
    <div className="min-h-screen w-full transition-all" style={{ backgroundColor: '${pageProps.canvasColor}' }}>
      <div className="mx-auto ${pageProps.maxWidth}">
        ${jsx}
      </div>
    </div>
  );
}`;
    // Use the pageTitle or ID for the filename
    zip.folder("src")?.folder("pages")?.file(`${pageName}.tsx`, code.trim());
    usedOnPage.forEach(u => allUsedComponents.add(u));
  });

  const cliCommand = `npx shadcn@latest add ${Array.from(allUsedComponents).map(c => COMPONENT_MAP[c]?.cli).filter(Boolean).join(" ")}`;
  zip.file("README.md", `# Generated Site\n\nRun this to install dependencies:\n\`\`\`bash\n${cliCommand}\n\`\`\``);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "project-export.zip");
}

// --- 3. MAIN UI COMPONENT ---
export default function App() {
  const [pages, setPages] = useState<Page[]>([
    { 
      id: "home", 
      data: { 
        content: [], 
        root: { 
          props: { 
            pageTitle: "Home", 
            pageRoute: "/", 
            canvasColor: "#ffffff", 
            maxWidth: "max-w-6xl" 
          } 
        }, 
        zones: {} 
      } 
    }
  ]);
  const [selectedPageId, setSelectedPageId] = useState("home");

  const currentPage = useMemo(() => pages.find(p => p.id === selectedPageId), [pages, selectedPageId]);

  const handleAddPage = () => {
    const newId = crypto.randomUUID();
    const newPage: Page = {
      id: newId,
      data: {
        content: [],
        root: {
          props: {
            pageTitle: "New Page",
            pageRoute: "/new-page",
            canvasColor: "#ffffff",
            maxWidth: "max-w-6xl"
          }
        },
        zones: {}
      }
    };
    setPages([...pages, newPage]);
    setSelectedPageId(newId);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      alert("Cannot delete the last page.");
      return;
    }
    const newPages = pages.filter(p => p.id !== selectedPageId);
    setPages(newPages);
    setSelectedPageId(newPages[0].id);
  };

  const handlePageDataChange = (newData: Data) => {
    setPages(prev => prev.map(p => p.id === selectedPageId ? { ...p, data: newData } : p));
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden font-sans">
      {/* Customize scrollbars for a cleaner look */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Main Workspace */}
      <main className="flex-1 relative overflow-hidden bg-gray-50">
        {currentPage && (
          <Puck
            key={selectedPageId} // Force re-render when page changes
            config={config}
            data={currentPage.data}
            onChange={handlePageDataChange}
            onPublish={async () => {
              try {
                await saveProject(pages, currentPage.data.root.props as RootProps);
              } catch (error) {
                console.error("Project export failed:", error);
              }
            }}
            overrides={{
              header: ({ actions }) => (
                <header className="h-[48px] w-full border-b border-gray-100 flex items-center justify-between px-4 z-[400] bg-white relative">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-4 text-sm font-medium text-gray-600">
                      <span className="flex items-center gap-1"><Monitor size={14} /> App</span>
                      <ChevronRight size={14} className="text-gray-400" />
                      <span className="text-zinc-900 font-bold">{currentPage.data.root.props.pageTitle}</span>
                      <span className="text-xs text-gray-400 ml-1 font-mono">({currentPage.data.root.props.pageRoute})</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                      <div className="relative group">
                        <select 
                          value={selectedPageId}
                          onChange={(e) => setSelectedPageId(e.target.value)}
                          className="appearance-none bg-white border border-gray-200 text-xs font-medium pl-8 pr-8 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[140px]"
                        >
                          {pages.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.data.root.props.pageTitle}
                            </option>
                          ))}
                        </select>
                        <File size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>

                      <div className="h-4 w-px bg-gray-300 mx-1"></div>

                      <button 
                        onClick={handleAddPage}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        title="Add New Page"
                      >
                        <Plus size={12} />
                        Add
                      </button>

                      <button 
                        onClick={handleDeletePage}
                        className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                        title="Delete Current Page"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                     <div className="flex items-center gap-2 border-l pl-3 ml-1">
                        {actions}
                     </div>
                  </div>
                </header>
              )
            }}
          />
        )}
      </main>
    </div>
  );
}
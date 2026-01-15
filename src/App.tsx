import React, { useMemo } from "react";
// Import Puck core components and types
// We use DropZone to allow components to be dropped inside Sections
import { Puck, type Config, type Data, DropZone } from "@puckeditor/core";

/**
 * FIX: Direct path to distribution CSS.
 * This is the standard workaround for Vite environments that struggle with 
 * the package's internal export map.
 */
import "@puckeditor/core/dist/index.css";

// Utilities for project generation and export
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AlertCircle } from "lucide-react";

// --- Shadcn UI Imports ---
/**
 * These imports assume you have run the following in your terminal:
 * npx shadcn@latest add accordion alert badge button card input label progress separator
 */
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
  // --- Root / Page Settings ---
  root: {
    fields: {
      canvasColor: { type: "text", label: "Canvas Background (Hex/CSS)" },
      maxWidth: { 
        type: "select", 
        label: "Page Max Width",
        options: [
          { label: "Standard (1200px)", value: "max-w-6xl" },
          { label: "Wide (1500px)", value: "max-w-7xl" },
          { label: "Full Width", value: "max-w-full" }
        ]
      }
    },
    defaultProps: {
      canvasColor: "#f9fafb",
      maxWidth: "max-w-6xl"
    },
    render: ({ children, canvasColor, maxWidth }) => (
      <div className="min-h-screen w-full transition-colors duration-300" style={{ backgroundColor: canvasColor }}>
        <div className={`mx-auto p-4 space-y-8 ${maxWidth}`}>
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
    // Advanced Section Component (Section 1, 2, 3...)
    Section: {
      fields: {
        sectionTitle: { type: "text", label: "Admin Label (e.g. Hero Section)" },
        columns: {
          type: "number",
          label: "Columns (1-6)",
        },
        gap: {
          type: "number",
          label: "Grid Gap (px)",
        },
        paddingY: {
          type: "number",
          label: "Vertical Padding / Row Size (px)",
        },
        bgColor: {
          type: "text",
          label: "Section Background Color",
        }
      },
      defaultProps: {
        sectionTitle: "New Section",
        columns: 1,
        gap: 24,
        paddingY: 40,
        bgColor: "transparent",
      },
      render: ({ columns, gap, paddingY, bgColor, sectionTitle }) => (
        <section 
          className="rounded-xl border border-dashed border-muted-foreground/30 relative min-h-[100px]"
          style={{ 
            backgroundColor: bgColor,
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            paddingLeft: '20px',
            paddingRight: '20px'
          }}
        >
          {/* Label for ease of use in the builder */}
          <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider z-10">
            {sectionTitle}
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
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      ),
      defaultProps: { title: "Card Title", description: "Description", content: "Main Content", footer: "" },
      fields: { title: { type: "text" }, description: { type: "text" }, content: { type: "textarea" }, footer: { type: "text" } },
    },
    Button: {
      render: ({ text, variant, size }) => <Button variant={variant} size={size} className="w-full">{text}</Button>,
      defaultProps: { text: "Button", variant: "default", size: "default" },
      fields: { 
        text: { type: "text" }, 
        variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }, { label: "Outline", value: "outline" }] },
        size: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Small", value: "sm" }, { label: "Large", value: "lg" }] }
      },
    },
    Input: {
      render: ({ placeholder, label, type }) => (
        <div className="grid w-full items-center gap-1.5 p-1">
          <Label className="mb-1">{label}</Label>
          <Input type={type} placeholder={placeholder} />
        </div>
      ),
      defaultProps: { placeholder: "Email", label: "Email", type: "email" },
      fields: { label: { type: "text" }, placeholder: { type: "text" }, type: { type: "select", options: [{ label: "Text", value: "text" }, { label: "Email", value: "email" }] } }
    },
    Accordion: {
      render: ({ items }) => (
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ),
      defaultProps: { items: [{ title: "New Item", content: "Content text" }] },
      fields: { items: { type: "array", arrayFields: { title: { type: "text" }, content: { type: "textarea" } } } },
    },
    Separator: {
      render: ({ orientation }) => <Separator orientation={orientation} className="my-4" />,
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
        <Alert variant={variant}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      ),
      defaultProps: { title: "Heads up!", description: "Add a description.", variant: "default" },
      fields: { title: { type: "text" }, description: { type: "text" }, variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }] } }
    },
    Progress: {
      render: ({ value, label }) => (
        <div className="w-full space-y-2">
          <Label>{label}</Label>
          <Progress value={value} />
        </div>
      ),
      defaultProps: { value: 33, label: "Loading..." },
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
          className="grid w-full" 
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
    <div className="min-h-screen w-full" style={{ backgroundColor: '${rootProps.canvasColor}' }}>
      <div className="mx-auto px-4 space-y-12 ${rootProps.maxWidth}">
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
  const initialData = useMemo(() => ({ 
    content: [], 
    root: { props: { canvasColor: "#f9fafb", maxWidth: "max-w-6xl" } }, 
    zones: {} 
  }), []);

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      height: "100vh", 
      width: "100vw", 
      display: "flex", 
      flexDirection: "column", 
      background: "#f9fafb" 
    }}>
      <Puck
        config={config}
        data={initialData}
        onPublish={async (data) => {
          try {
            await saveProject([{ path: "/", name: "Home", data }], data.root.props as RootProps);
          } catch (error) {
            console.error("Export failed:", error);
          }
        }}
      />
    </div>
  );
}
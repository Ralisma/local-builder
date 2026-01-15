import React, { useMemo, useState } from "react";
// Import Puck core and types
import { Puck, type Config, type Data } from "@puckeditor/core";

/**
 * FIX: Direct path to distribution CSS.
 * This resolves the "Missing specifier" error in many Vite configurations.
 */
import "@puckeditor/core/dist/index.css";

// Utilities for project generation and export
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AlertCircle } from "lucide-react";

// --- Shadcn UI Imports ---
/**
 * These imports assume you have run the following:
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
  Button: { text: string; variant: "default" | "destructive" | "outline" | "secondary"; size: "default" | "sm" | "lg" };
  Badge: { text: string; variant: "default" | "secondary" | "outline" };
  Card: { title: string; description: string; content: string; footer: string };
  Accordion: { items: { title: string; content: string }[] };
  Input: { type: string; placeholder: string; label: string };
  Alert: { title: string; description: string; variant: "default" | "destructive" };
  Progress: { value: number; label: string };
  Separator: { orientation: "horizontal" | "vertical" };
};

const config: Config<Props> = {
  categories: {
    Layout: { components: ["Card", "Separator", "Accordion"] },
    Forms: { components: ["Button", "Input"] },
    Display: { components: ["Badge", "Progress"] },
    Feedback: { components: ["Alert"] },
  },
  components: {
    Card: {
      render: ({ title, description, content, footer }) => (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      ),
      defaultProps: { title: "Card Title", description: "Description", content: "Main Content", footer: "" },
      fields: { 
        title: { type: "text" }, 
        description: { type: "text" }, 
        content: { type: "textarea" }, 
        footer: { type: "text" } 
      },
    },
    Button: {
      render: ({ text, variant, size }) => <Button variant={variant} size={size}>{text}</Button>,
      defaultProps: { text: "Button", variant: "default", size: "default" },
      fields: { 
        text: { type: "text" }, 
        variant: { type: "select", options: [
          { label: "Default", value: "default" }, 
          { label: "Destructive", value: "destructive" }, 
          { label: "Outline", value: "outline" },
          { label: "Secondary", value: "secondary" }
        ]},
        size: { type: "select", options: [
          { label: "Default", value: "default" }, 
          { label: "Small", value: "sm" }, 
          { label: "Large", value: "lg" }
        ]}
      },
    },
    Input: {
      render: ({ placeholder, label, type }) => (
        <div className="grid w-full max-w-sm items-center gap-1.5 p-1">
          <Label className="mb-1">{label}</Label>
          <Input type={type} placeholder={placeholder} />
        </div>
      ),
      defaultProps: { placeholder: "Email", label: "Email", type: "email" },
      fields: { 
        label: { type: "text" }, 
        placeholder: { type: "text" }, 
        type: { type: "select", options: [
          { label: "Text", value: "text" }, 
          { label: "Email", value: "email" },
          { label: "Password", value: "password" }
        ]} 
      }
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
      fields: { 
        items: { 
          type: "array", 
          arrayFields: { 
            title: { type: "text" }, 
            content: { type: "textarea" } 
          } 
        } 
      },
    },
    Separator: {
      render: ({ orientation }) => <Separator orientation={orientation} className="my-4" />,
      defaultProps: { orientation: "horizontal" },
      fields: { 
        orientation: { 
          type: "select", 
          options: [
            { label: "Horizontal", value: "horizontal" }, 
            { label: "Vertical", value: "vertical" }
          ] 
        } 
      },
    },
    Badge: {
      render: ({ text, variant }) => <Badge variant={variant}>{text}</Badge>,
      defaultProps: { text: "Badge", variant: "default" },
      fields: { 
        text: { type: "text" }, 
        variant: { type: "select", options: [
          { label: "Default", value: "default" }, 
          { label: "Secondary", value: "secondary" }, 
          { label: "Outline", value: "outline" }
        ]} 
      },
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
      fields: {
        title: { type: "text" },
        description: { type: "text" },
        variant: { type: "select", options: [{ label: "Default", value: "default" }, { label: "Destructive", value: "destructive" }] }
      }
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

const generateJSX = (item: any): string => {
  const { type, props } = item;
  switch (type) {
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

async function saveProject(pages: { path: string; name: string; data: Data }[]) {
  const zip = new JSZip();
  const allUsedComponents = new Set<string>();

  pages.forEach((page) => {
    const usedOnPage = new Set<string>();
    page.data.content.forEach(i => {
      usedOnPage.add(i.type);
      if (["Input", "Progress"].includes(i.type)) usedOnPage.add("Label");
    });
    
    const importStr = Array.from(usedOnPage)
      .map(t => COMPONENT_MAP[t] ? `import { ${COMPONENT_MAP[t].imports.join(", ")} } from "${COMPONENT_MAP[t].path}";` : "")
      .filter(Boolean)
      .join("\n");
      
    const jsx = page.data.content.map(generateJSX).join("\n      ");
    
    const code = `import React from 'react';\nimport { AlertCircle } from "lucide-react";\n${importStr}\n\nexport default function ${page.name}() {\n  return (\n    <div className="p-10 space-y-10 max-w-4xl mx-auto">\n      ${jsx}\n    </div>\n  );\n}`;
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
  const initialData = useMemo(() => ({ content: [], root: {} }), []);

  return (
    /**
     * WORKAROUND: White Screen Fix
     * We use position: fixed to force the container to take up the full viewport.
     * This bypasses any inherited height issues from parent elements or Tailwind resets.
     */
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
            await saveProject([{ path: "/", name: "Home", data }]);
          } catch (error) {
            console.error("Export failed:", error);
          }
        }}
      />
    </div>
  );
}
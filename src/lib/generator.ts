import { type Data } from "@puckeditor/core";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { type RootProps, type Page } from "@/types";

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

export async function saveProject(pages: Page[]) {
  const zip = new JSZip();
  const allUsedComponents = new Set<string>();

  pages.forEach((page) => {
    const pageProps = page.data.root.props as RootProps;
    const pageName = pageProps?.pageTitle?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "untitled";
    
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
    <div className="min-h-screen w-full transition-all" style={{ backgroundColor: '${pageProps?.canvasColor}' }}>
      <div className="mx-auto ${pageProps?.maxWidth}">
        ${jsx}
      </div>
    </div>
  );
}`;
    zip.folder("src")?.folder("pages")?.file(`${pageName}.tsx`, code.trim());
    usedOnPage.forEach(u => allUsedComponents.add(u));
  });

  const cliCommand = `npx shadcn@latest add ${Array.from(allUsedComponents).map(c => COMPONENT_MAP[c]?.cli).filter(Boolean).join(" ")}`;
  zip.file("README.md", `# Generated Site\n\nRun this to install dependencies:\n\`\`\`bash\n${cliCommand}\n\`\`\``);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "project-export.zip");
}
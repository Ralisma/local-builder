import { Data } from "@puckeditor/core";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface PageConfig { 
  path: string; 
  name: string; 
  data: Data; 
}

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
    case "Card": 
      return `
      <Card>
        <CardHeader>
          <CardTitle>${props.title}</CardTitle>
          <CardDescription>${props.description}</CardDescription>
        </CardHeader>
        <CardContent>${props.content}</CardContent>
        ${props.footer ? `<CardFooter>${props.footer}</CardFooter>` : ""}
      </Card>`;
    case "Button": 
      return `<Button variant="${props.variant}" size="${props.size}">${props.text}</Button>`;
    case "Badge": 
      return `<Badge variant="${props.variant}">${props.text}</Badge>`;
    case "Separator": 
      return `<Separator orientation="${props.orientation}" />`;
    case "Alert":
      return `
      <Alert variant="${props.variant}">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>${props.title}</AlertTitle>
        <AlertDescription>${props.description}</AlertDescription>
      </Alert>`;
    case "Progress":
      return `
      <div className="w-full space-y-2">
        <Label>${props.label}</Label>
        <Progress value={${props.value}} />
      </div>`;
    case "Input": 
      return `
      <div className="space-y-2">
        <Label>${props.label}</Label>
        <Input type="${props.type}" placeholder="${props.placeholder}" />
      </div>`;
    case "Accordion": 
      return `
      <Accordion type="single" collapsible>
        ${props.items?.map((it: any, i: number) => `
        <AccordionItem value="item-${i}">
          <AccordionTrigger>${it.title}</AccordionTrigger>
          <AccordionContent>${it.content}</AccordionContent>
        </AccordionItem>`).join("")}
      </Accordion>`;
    default: 
      return "";
  }
};

export async function saveProject(pages: PageConfig[]) {
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
    
    const code = `
import React from 'react';
import { AlertCircle } from "lucide-react";
${importStr}

export default function ${page.name}() {
  return (
    <div className="p-10 space-y-10 max-w-4xl mx-auto">
      ${jsx}
    </div>
  );
}
    `;
    zip.folder("src")?.folder("pages")?.file(`${page.name}.tsx`, code.trim());
    usedOnPage.forEach(u => allUsedComponents.add(u));
  });

  const cliCommand = `npx shadcn@latest add ${Array.from(allUsedComponents).map(c => COMPONENT_MAP[c]?.cli).filter(Boolean).join(" ")}`;
  
  zip.file("README.md", `# Generated Site\n\nRun this to install dependencies:\n\`\`\`bash\n${cliCommand}\n\`\`\``);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "project-export.zip");
}
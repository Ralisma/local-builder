import { Config, DropZone } from "@puckeditor/core";
import { AlertCircle } from "lucide-react";
import { Props, RootProps } from "@/types";

// Shadcn Components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export const config: Config<Props, RootProps> = {
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
    Pages: { components: [] }
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
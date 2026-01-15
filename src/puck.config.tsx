import type { Config } from "@puckeditor/core";
import React from "react";

// Shadcn UI Imports - These assume you have run 'npx shadcn add ...'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

type Props = {
  Button: { text: string; variant: "default" | "destructive" | "outline" | "secondary"; size: "default" | "sm" | "lg" };
  Badge: { text: string; variant: "default" | "secondary" | "outline" };
  Card: { title: string; description: string; content: string; footer: string };
  Accordion: { items: { title: string; content: string }[] };
  Tabs: { defaultValue: string; items: { value: string; label: string; content: string }[] };
  Input: { type: string; placeholder: string; label: string };
  Alert: { title: string; description: string; variant: "default" | "destructive" };
  Progress: { value: number; label: string };
  Separator: { orientation: "horizontal" | "vertical" };
};

export const config: Config<Props> = {
  categories: {
    Layout: { components: ["Card", "Separator", "Accordion", "Tabs"] },
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
      defaultProps: { items: [{ title: "Item 1", content: "Content text" }] },
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
    }
  },
};
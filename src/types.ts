import { Data } from "@puckeditor/core";

export type Props = {
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

export type RootProps = {
  canvasColor: string;
  maxWidth: string;
  pageTitle: string;
  pageRoute: string;
};

export interface Page {
  id: string;
  data: Data;
}
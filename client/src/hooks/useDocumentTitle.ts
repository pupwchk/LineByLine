import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function useMetaDescription(description: string) {
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "description";
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = description;
  }, [description]);
}

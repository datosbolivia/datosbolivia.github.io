export interface PortalConfig {
  organization: {
    name: string;
    slug: string;
    url: string;
    github: string;
    description: string;
  };
  site: {
    title: string;
    description: string;
    tagline: string;
    url: string;
    base: string;
  };
  whitepaper: {
    title: string;
    author: string;
    doi: string;
    doiUrl: string;
    pdfUrl: string;
    abstract: string;
  };
  community: {
    talks: Array<{
      title: string;
      date: string;
      speaker: string;
      repoUrl: string;
      videoUrl: string;
      description: string;
    }>;
  };
  pwa: {
    enabled: boolean;
    name: string;
    shortName: string;
    themeColor: string;
    backgroundColor: string;
  };
  desktopApp: {
    enabled: boolean;
    name: string;
    downloadUrl: string;
    enableLocalProcessing: boolean;
  };
  nav: Array<{
    label: string;
    path: string;
  }>;
}

export const config: PortalConfig = {
  organization: {
    name: "Datos Bolivia",
    slug: "datos-bolivia",
    url: "https://datos-bolivia.github.io",
    github: "https://github.com/andres-chirinos/catalogo-datamesh",
    description: "Iniciativa colaborativa y abierta de datos abiertos de Bolivia."
  },
  site: {
    title: "Datos Bolivia",
    description: "Portal catálogo de Datos Abiertos de Bolivia",
    tagline: "Datos abiertos y descentralizados para la comunidad.",
    url: "https://datos-bolivia.github.io",
    base: "/"
  },
  pwa: {
    enabled: true,
    name: "DataMesh Bolivia - Portal de Datos",
    shortName: "DatosBolivia",
    themeColor: "#0b243f",
    backgroundColor: "#fafafa"
  },
  desktopApp: {
    enabled: true,
    name: "DataMesh Bolivia Desktop",
    downloadUrl: "https://github.com/andres-chirinos/catalogo-datamesh/releases",
    enableLocalProcessing: true
  },
  nav: [
    { label: "Inicio", path: "/" },
    { label: "Datasets", path: "/datasets" },
    { label: "Acerca de", path: "/about" },
    { label: "Docs", path: "/docs" },
    { label: "Descargas", path: "/download" }
  ]
};

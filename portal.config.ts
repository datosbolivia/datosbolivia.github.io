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
    key?: string;
    path: string;
  }>;
}

export const config: PortalConfig = {
  organization: {
    name: "Datos Bolivia",
    slug: "datos-bolivia",
    url: "https://datos-bolivia.github.io",
    github: "https://github.com/datosbolivia/catalogo-datamesh",
    description: "Iniciativa colaborativa y abierta de datos federados de Bolivia."
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
    downloadUrl: "https://github.com/datosbolivia/catalogo-datamesh/releases",
    enableLocalProcessing: true
  },
  nav: [
    { label: "Inicio", key: "nav.home", path: "/" },
    { label: "Datasets", key: "nav.datasets", path: "/datasets" },
    { label: "Acerca de", key: "nav.about", path: "/about" },
    { label: "Docs", key: "nav.docs", path: "/docs" },
    { label: "Descargas", key: "nav.download", path: "/download" }
  ]
};

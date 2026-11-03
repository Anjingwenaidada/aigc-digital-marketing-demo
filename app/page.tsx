"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import productSeed from "./data/product.json";
import templateSeed from "./data/template.json";

type Screen =
  | "landing"
  | "home"
  | "materials"
  | "select"
  | "confirm"
  | "template"
  | "edit"
  | "projects"
  | "poster-home"
  | "poster-templates"
  | "poster-editor"
  | "video-home"
  | "video-learning"
  | "video-create"
  | "qa"
  | "team"
  | "assets"
  | "knowledge"
  | "admin"
  | "placeholder";
type ProjectStatus = "草稿" | "待审核" | "已通过" | "已驳回";
type Product = typeof productSeed;
type TextLayerStyle = { fontSize: number; fontFamily: string; x: number; y: number; fontWeight: number; scale?: number };
type PageNumber = 1 | 2;
type FreeImage = { id: string; src: string; name: string; category: string; page: PageNumber; x: number; y: number; width: number };
type CustomText = { id: string; title: string; content: string; page: PageNumber; x: number; y: number; width: number; fontSize: number; fontWeight: number };
type PosterType = "solar" | "product";
type PosterTemplate = { id: string; name: string; type: PosterType; src: string; source: "企业内部" | "历史作品" | "稿定推荐（演示）"; tags: string[] };
type VideoCategory = "training" | "exhibition" | "social" | "launch";
type VideoCourse = { id: string; title: string; product: string; duration: string; level: string; progress: number; src: string; chapters: string[] };
type QaMessage = { id: string; role: "user" | "assistant"; content: string; sources?: string[]; confidence?: number };
type LibraryCategory = "leaflet" | "product-poster" | "solar-poster" | "product-image" | "brand" | "video";
type LibraryAsset = { id: string; name: string; category: LibraryCategory; categoryLabel: string; files: string[]; source: string; tags: string[] };
type DesignWorkflowStatus = "设计制作中" | "AI审核中" | "待业务确认" | "已归档";
type KnowledgeView = "overview" | "brand" | "products";
type KnowledgeItemStatus = "已启用" | "已停用";
type BrandKnowledgeItem = { id: string; title: string; description: string; icon: string; status: KnowledgeItemStatus };
type ProductKnowledgeItem = { id: string; model: string; name: string; image: string; sourceCount: number; status: KnowledgeItemStatus };

const productCatalog: Product[] = [
  productSeed,
  {
    ...productSeed,
    id: "nezha",
    name: "哪吒",
    displayName: "哪吒 多功能局放测试仪",
    model: "PD-6",
    category: "局部放电检测设备",
    positioning: "面向电力设备现场巡检与局部放电定位的多功能测试仪",
    summary: "哪吒多功能局放测试仪用于电力设备局部放电检测、信号采集与现场诊断，支持多种传感器接入，帮助检修人员快速判断设备绝缘状态。",
    features: ["多通道信号采集，适配多种检测传感器", "支持时域、频域等多种分析视图", "现场快速检测，数据可保存与导出", "便携式设计，适合变电站与工厂巡检"],
    targets: "变压器、开关柜、电缆接头、GIS 等电力设备",
    applications: ["电力行业", "变电站运维", "工业企业", "设备检修"],
    images: ["/assets/products/nezha/main.png", "/assets/products/nezha/alt-1.png", "/assets/products/nezha/alt-2.png"],
    screens: [],
    sources: [{ name: "哪吒多功能局放测试仪操作手册", type: "产品说明书", status: "已导入" }],
  },
  {
    ...productSeed,
    id: "zhaolu",
    name: "朝露",
    displayName: "朝露 露点仪",
    model: "DPM-01",
    category: "气体露点检测设备",
    positioning: "面向压缩空气、工业气体及电力设备的便携式露点检测仪",
    summary: "朝露露点仪用于快速测量压缩空气和工业气体中的露点温度，通过稳定采样与清晰显示帮助运维人员判断系统干燥度，适合现场巡检、设备验收和质量控制。",
    features: ["快速响应：采样后快速稳定读数，减少现场等待时间", "高灵敏检测：准确识别气体含水量变化，辅助判断干燥状态", "多场景适配：支持压缩空气、工业气体及电力设备检测", "便携式设计：机身轻巧，适合现场巡检和设备维护", "清晰显示：关键测量结果直观呈现，便于快速判读", "数据可追溯：支持测量数据记录，方便后续分析与报告整理"],
    targets: "压缩空气系统、变电站、气体生产与储运设备",
    applications: ["电力行业", "压缩空气", "气体检测", "工业质检"],
    images: ["/assets/products/zhaolu/main.png", "/assets/products/zhaolu/alt-1.png", "/assets/products/zhaolu/alt-2.png"],
    screens: [],
    sources: [{ name: "朝露露点仪说明书", type: "产品说明书", status: "已导入" }],
  },
];

const defaultTextStyles: Record<string, TextLayerStyle> = {
  "产品标题": { fontSize: 4.2, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 700 },
  "产品介绍": { fontSize: 1.72, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 400 },
  "核心卖点": { fontSize: 1.72, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 400 },
  "应用领域": { fontSize: 1.72, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 400 },
  "被测对象": { fontSize: 1.72, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 400 },
  "参数表": { fontSize: 1.35, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 400, scale: 1 },
  "测试标准": { fontSize: 1.45, fontFamily: "Alibaba PuHuiTi", x: 0, y: 0, fontWeight: 400, scale: 1 },
};

const navItems = [
  ["home", "⌂", "首页"],
  ["materials", "▦", "平面物料"],
  ["video", "▶", "宣传视频"],
  ["qa", "✦", "产品问答"],
  ["projects", "▣", "项目"],
  ["team", "♙", "团队空间"],
  ["assets", "▧", "素材库"],
  ["knowledge", "▤", "知识库"],
  ["admin", "⚙", "平台管理"],
] as const;

const materialTypes = [
  ["海报", "新品发布、活动宣传、社媒传播", "产品海报 / 活动海报 / 社媒海报"],
  ["产品说明书", "自动编排产品参数与使用说明", "单品说明书 / 系列说明书"],
  ["产品宣传彩页", "基于真实资料生成双页产品彩页", "宣传单页 / 双页 / 三折页"],
  ["自研产品标贴", "统一型号、参数及合规标识", "产品铭牌 / 包装标贴"],
  ["公司品牌物料", "沉淀并复用公司统一品牌资产", "名片 / 信纸 / 文化墙"],
  ["展会物料", "覆盖展前、现场及会后传播", "易拉宝 / 背景板 / 桌牌"],
] as const;

const referenceLeaflets = [
  "IPD270 多源局放检测模块",
  "UR-15 宽带阻抗谱测试仪",
  "子龙带电局放测试仪",
  "TRW-310 三相直阻、有载分接开关测试仪",
  "后羿 激光清障仪",
];

const standardsByProduct: Record<string, string[]> = {
  nezha: [
    "Q/GDW 11838-2018《配电电缆线路试验规程》7.3 中对高频局部放电检测的要求",
    "Q/GDW 1140-2015《电力设备高频局部放电带电检测技术现场应用导则》7.1 中的相关要求",
  ],
};

const baseLayers = ["产品标题", "产品介绍", "产品主图", "核心卖点", "被测对象", "应用领域", "测试标准", "参数表", "图片素材", "品牌标识", "背景"];

const posterTemplates: PosterTemplate[] = [
  { id: "solar-chunfen", name: "春分 · 龙抬头", type: "solar", src: "/assets/posters/solar-chunfen.jpg", source: "历史作品", tags: ["春季", "国潮"] },
  { id: "solar-qingming", name: "清明时节", type: "solar", src: "/assets/posters/solar-qingming.jpg", source: "企业内部", tags: ["春季", "山水"] },
  { id: "solar-lichun", name: "立春 · 万物复苏", type: "solar", src: "/assets/posters/solar-lichun.jpg", source: "稿定推荐（演示）", tags: ["春季", "品牌传播"] },
  { id: "festival-new-year", name: "开工大吉", type: "solar", src: "/assets/posters/festival-new-year.jpg", source: "历史作品", tags: ["节日活动", "国潮"] },
  { id: "product-houyi", name: "后羿激光清障仪", type: "product", src: "/assets/posters/product-houyi.jpg", source: "企业内部", tags: ["核心卖点", "应用场景"] },
  { id: "product-baiju", name: "白驹回路电阻测试仪", type: "product", src: "/assets/posters/product-baiju.jpg", source: "历史作品", tags: ["产品功能", "结构展示"] },
  { id: "product-cannavaro", name: "断路器机械特性分析仪", type: "product", src: "/assets/posters/product-cannavaro-v2.jpg", source: "稿定推荐（演示）", tags: ["新品发布", "工业科技"] },
  { id: "product-ronaldo", name: "Ronaldo 电缆故障测试仪", type: "product", src: "/assets/posters/product-ronaldo.jpg", source: "历史作品", tags: ["产品功能", "应用场景"] },
];

const videoCourses: VideoCourse[] = [
  { id: "pld-11-operation", title: "PLD-11 智能数字听漏仪操作教程", product: "大海智能数字听漏仪", duration: "12:36", level: "基础课程", progress: 72, src: "/assets/products/pld-11/front.png", chapters: ["产品与配件介绍", "开机及参数设置", "听漏检测操作", "数据保存与注意事项"] },
  { id: "pd-6-inspection", title: "PD-6 多功能局放测试仪现场检测", product: "哪吒多功能局放测试仪", duration: "18:20", level: "进阶课程", progress: 0, src: "/assets/products/nezha/main.png", chapters: ["检测原理说明", "传感器连接", "现场检测流程", "波形判断与报告"] },
  { id: "dpm-01-guide", title: "DPM-01 露点仪使用与维护", product: "朝露露点仪", duration: "09:48", level: "基础课程", progress: 100, src: "/assets/products/zhaolu/main.png", chapters: ["仪器功能介绍", "采样管路连接", "露点测量步骤", "日常维护保养"] },
];

const materialLibraryAssets: LibraryAsset[] = [
  { id: "pld-leaflet", name: "PLD-11 智能数字听漏仪双页彩页", category: "leaflet", categoryLabel: "产品宣传彩页", files: ["/assets/templates/leaflet/preview-page-1.png", "/assets/templates/leaflet/preview-page-2.png"], source: "项目现有 PLD-11 彩页资料", tags: ["PLD-11", "听漏仪", "双页彩页"] },
  { id: "poster-houyi", name: "后羿 大功率激光清障仪产品海报", category: "product-poster", categoryLabel: "产品海报", files: ["/assets/posters/product-houyi.jpg"], source: "用户提供的历史产品海报", tags: ["后羿", "激光清障仪"] },
  { id: "poster-baiju", name: "白驹 回路电阻测试仪产品海报", category: "product-poster", categoryLabel: "产品海报", files: ["/assets/posters/product-baiju.jpg"], source: "用户提供的历史产品海报", tags: ["白驹", "回路电阻测试仪"] },
  { id: "poster-cannavaro", name: "断路器机械特性诊断分析仪产品海报", category: "product-poster", categoryLabel: "产品海报", files: ["/assets/posters/product-cannavaro-v1.jpg", "/assets/posters/product-cannavaro-v2.jpg"], source: "用户提供的两张产品海报", tags: ["断路器", "机械特性分析仪"] },
  { id: "poster-ronaldo", name: "Ronaldo 电缆故障测试仪产品海报", category: "product-poster", categoryLabel: "产品海报", files: ["/assets/posters/product-ronaldo.jpg"], source: "用户提供的历史产品海报", tags: ["Ronaldo", "电缆故障"] },
  { id: "solar-chunfen", name: "春分 · 龙抬头品牌海报", category: "solar-poster", categoryLabel: "节气海报", files: ["/assets/posters/solar-chunfen.jpg"], source: "用户提供的节气海报", tags: ["春分", "龙抬头"] },
  { id: "solar-qingming", name: "清明节气品牌海报", category: "solar-poster", categoryLabel: "节气海报", files: ["/assets/posters/solar-qingming.jpg"], source: "用户提供的节气海报", tags: ["清明", "文明祭祀"] },
  { id: "solar-lichun", name: "立春 · 万物复苏品牌海报", category: "solar-poster", categoryLabel: "节气海报", files: ["/assets/posters/solar-lichun.jpg"], source: "用户提供的节气海报", tags: ["立春", "万物复苏"] },
  { id: "festival-new-year", name: "开工大吉品牌海报", category: "solar-poster", categoryLabel: "节日海报", files: ["/assets/posters/festival-new-year.jpg"], source: "用户提供的节日海报", tags: ["开工大吉", "新年"] },
  { id: "product-pld", name: "PLD-11 智能数字听漏仪产品图片", category: "product-image", categoryLabel: "产品图片", files: ["/assets/products/pld-11/angle.png", "/assets/products/pld-11/front.png", "/assets/products/pld-11/top.png"], source: "PLD-11 产品资料", tags: ["PLD-11", "听漏仪"] },
  { id: "product-nezha", name: "哪吒 多功能局放测试仪产品图片", category: "product-image", categoryLabel: "产品图片", files: ["/assets/products/nezha/main.png", "/assets/products/nezha/alt-1.png", "/assets/products/nezha/alt-2.png"], source: "哪吒产品资料", tags: ["哪吒", "局放测试仪"] },
  { id: "product-zhaolu", name: "朝露 露点仪产品图片", category: "product-image", categoryLabel: "产品图片", files: ["/assets/products/zhaolu/main.png", "/assets/products/zhaolu/alt-1.png", "/assets/products/zhaolu/alt-2.png"], source: "朝露产品资料", tags: ["朝露", "露点仪"] },
  { id: "brand-kgt", name: "KGT 企业品牌 Logo", category: "brand", categoryLabel: "品牌素材", files: ["/assets/posters/kgt-logo.png"], source: "用户提供的 KGT Logo", tags: ["KGT", "Logo", "品牌"] },
];

function Stepper({ step }: { step: number }) {
  const names = ["选择产品", "确认资料", "选择模板", "编辑与导出"];
  return (
    <div className="stepper" aria-label={`当前第${step}步`}>
      {names.map((name, index) => {
        const number = index + 1;
        return (
          <div className={`step ${number === step ? "active" : ""} ${number < step ? "done" : ""}`} key={name}>
            <span className="step-number">{number < step ? "✓" : number}</span>
            <span>{name}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={`status status-${status}`}>{status}</span>;
}

function ScreenAsset({ src, index }: { src: string; index: number }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <div className="asset-missing">界面图 {index + 1}<small>待补充</small></div>;
  return <img src={src} alt={`产品操作界面${index + 1}`} onError={() => setFailed(true)} />;
}

function LeafletPage({
  page,
  product,
  selectedLayer,
  imageScale,
  imageX,
  imageY,
  titleSize,
  titleColor,
  editable = false,
  onSelectProduct,
  onMoveProduct,
  textStyles,
  onSelectText,
  onMoveText,
  onUpdateParameter,
  pageAssignments,
  standards,
  customTexts,
  freeImages,
  onMoveFreeImage,
}: {
  page: number;
  product: Product;
  selectedLayer?: string;
  imageScale: number;
  imageX: number;
  imageY: number;
  titleSize: number;
  titleColor: string;
  editable?: boolean;
  onSelectProduct?: () => void;
  onMoveProduct?: (deltaX: number, deltaY: number) => void;
  textStyles?: Record<string, TextLayerStyle>;
  onSelectText?: (layer: string) => void;
  onMoveText?: (layer: string, deltaX: number, deltaY: number) => void;
  onUpdateParameter?: (index: number, key: string, value: string) => void;
  pageAssignments: Record<string, PageNumber>;
  standards: string[];
  customTexts: CustomText[];
  freeImages: FreeImage[];
  onMoveFreeImage?: (id: string, deltaX: number, deltaY: number) => void;
}) {
  const dragPoint = useRef<{ x: number; y: number } | null>(null);
  const dragText = useRef<{ layer: string; x: number; y: number } | null>(null);
  const dragFreeImage = useRef<{ id: string; x: number; y: number } | null>(null);

  function beginProductDrag(event: ReactPointerEvent<HTMLImageElement>) {
    if (!editable) return;
    event.preventDefault();
    onSelectProduct?.();
    dragPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveProduct(event: ReactPointerEvent<HTMLImageElement>) {
    if (!editable || !dragPoint.current) return;
    const deltaX = event.clientX - dragPoint.current.x;
    const deltaY = event.clientY - dragPoint.current.y;
    dragPoint.current = { x: event.clientX, y: event.clientY };
    onMoveProduct?.(deltaX, deltaY);
  }

  function endProductDrag(event: ReactPointerEvent<HTMLImageElement>) {
    dragPoint.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function beginTextDrag(layer: string, event: ReactPointerEvent<HTMLElement>) {
    if (!editable) return;
    event.preventDefault();
    onSelectText?.(layer);
    dragText.current = { layer, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveText(event: ReactPointerEvent<HTMLElement>) {
    if (!editable || !dragText.current) return;
    const deltaX = event.clientX - dragText.current.x;
    const deltaY = event.clientY - dragText.current.y;
    dragText.current = { ...dragText.current, x: event.clientX, y: event.clientY };
    onMoveText?.(dragText.current.layer, deltaX, deltaY);
  }

  function endTextDrag(event: ReactPointerEvent<HTMLElement>) {
    dragText.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function beginFreeImageDrag(id: string, event: ReactPointerEvent<HTMLImageElement>) {
    if (!editable) return;
    event.preventDefault();
    onSelectText?.(`image:${id}`);
    dragFreeImage.current = { id, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveFreeImage(event: ReactPointerEvent<HTMLImageElement>) {
    if (!editable || !dragFreeImage.current) return;
    const deltaX = event.clientX - dragFreeImage.current.x;
    const deltaY = event.clientY - dragFreeImage.current.y;
    dragFreeImage.current = { ...dragFreeImage.current, x: event.clientX, y: event.clientY };
    onMoveFreeImage?.(dragFreeImage.current.id, deltaX, deltaY);
  }

  function endFreeImageDrag(event: ReactPointerEvent<HTMLImageElement>) {
    dragFreeImage.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const textStyle = (layer: string): React.CSSProperties => {
    const style = textStyles?.[layer] ?? defaultTextStyles[layer];
    return style ? { transform: `translate(${style.x}px, ${style.y}px) scale(${style.scale ?? 1})`, transformOrigin: "top left", fontFamily: style.fontFamily, fontWeight: style.fontWeight, fontSize: `${style.fontSize}cqw` } : {};
  };
  const paragraphStyle = (layer: string): React.CSSProperties => {
    const style = textStyles?.[layer] ?? defaultTextStyles[layer];
    return style ? { fontFamily: style.fontFamily, fontSize: `${style.fontSize}cqw`, fontWeight: style.fontWeight } : {};
  };
  const headingStyle = (layer: string): React.CSSProperties => {
    const style = textStyles?.[layer] ?? defaultTextStyles[layer];
    return style ? { fontFamily: style.fontFamily, fontSize: `${Math.max(2.4, style.fontSize * 1.86)}cqw`, fontWeight: Math.max(400, style.fontWeight) } : {};
  };
  const titleTransform = textStyles?.["产品标题"] ?? defaultTextStyles["产品标题"];
  const pageFreeImages = freeImages.filter((item) => item.page === page);
  const pageCustomTexts = customTexts.filter((item) => item.page === page);

  const movableAssets = <>
    {pageFreeImages.map((item) => <img key={item.id} className={`free-image ${editable ? "draggable-product" : ""} ${selectedLayer === `image:${item.id}` ? "selected-object" : ""}`} src={item.src} alt={item.name} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%` }} draggable={false} onPointerDown={(event) => beginFreeImageDrag(item.id, event)} onPointerMove={moveFreeImage} onPointerUp={endFreeImageDrag} onPointerCancel={endFreeImageDrag} />)}
    {pageCustomTexts.map((item) => <section key={item.id} className={`custom-text draggable-text ${selectedLayer === `custom:${item.id}` ? "selected-object" : ""}`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, fontSize: `${item.fontSize}cqw`, fontWeight: item.fontWeight }} onPointerDown={(event) => beginTextDrag(`custom:${item.id}`, event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>{item.title}</h2><p>{item.content}</p></section>)}
  </>;

  if (page === 2) {
    return (
      <div className="leaflet-page leaflet-page-2">
        <img className="leaflet-bg" src={templateSeed.background} alt="康高特彩页固定背景" />
        <div className="leaflet-series">— {product.name} —</div>
        <div className={`leaflet-title-band ${selectedLayer === "产品标题" ? "selected-object" : ""}`} style={{ color: titleColor, fontSize: `${titleSize / 10}cqw`, transform: `translate(${titleTransform.x}px, ${titleTransform.y}px)` }} onPointerDown={(event) => beginTextDrag("产品标题", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>{product.displayName}</div>
        {pageAssignments["产品介绍"] === 2 && <section className={`moved-module moved-intro draggable-text ${selectedLayer === "产品介绍" ? "selected-object" : ""}`} style={textStyle("产品介绍")} onPointerDown={(event) => beginTextDrag("产品介绍", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>产品功能</h2><p>{product.summary}</p></section>}
        {pageAssignments["核心卖点"] === 2 && <section className={`moved-module moved-features draggable-text ${selectedLayer === "核心卖点" ? "selected-object" : ""}`} style={textStyle("核心卖点")} onPointerDown={(event) => beginTextDrag("核心卖点", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>产品特点</h2>{product.features.map((feature) => <p key={feature}>■ {feature}</p>)}</section>}
        {pageAssignments["被测对象"] === 2 && <section className={`moved-module moved-targets draggable-text ${selectedLayer === "被测对象" ? "selected-object" : ""}`} style={textStyle("被测对象")} onPointerDown={(event) => beginTextDrag("被测对象", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>被测物</h2><p>{product.targets}</p></section>}
        {pageAssignments["应用领域"] === 2 && <section className={`moved-module moved-applications draggable-text ${selectedLayer === "应用领域" ? "selected-object" : ""}`} style={textStyle("应用领域")} onPointerDown={(event) => beginTextDrag("应用领域", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>应用领域</h2><p>{product.applications.map((item) => `■ ${item}`).join("　")}</p></section>}
        {pageAssignments["参数表"] === 2 && <section className={`parameter-section draggable-text ${selectedLayer === "参数表" ? "selected-object" : ""}`} style={textStyle("参数表")} onPointerDown={(event) => beginTextDrag("参数表", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>
          <h2>技术参数</h2>
          <table>
            <thead><tr><th>功能选项</th><th>参数说明</th></tr></thead>
            <tbody>{product.parameters.map(([key, value], index) => <tr key={`${key}-${index}`}><td contentEditable={editable} suppressContentEditableWarning onBlur={(event) => onUpdateParameter?.(index, event.currentTarget.textContent ?? key, value)}>{key}</td><td contentEditable={editable} suppressContentEditableWarning onBlur={(event) => onUpdateParameter?.(index, key, event.currentTarget.textContent ?? value)}>{value}</td></tr>)}</tbody>
          </table>
        </section>}
        {pageAssignments["测试标准"] === 2 && <section className={`standards-section draggable-text ${selectedLayer === "测试标准" ? "selected-object" : ""}`} style={textStyle("测试标准")} onPointerDown={(event) => beginTextDrag("测试标准", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>测试标准</h2>{standards.length ? standards.map((standard, index) => <p key={`${standard}-${index}`}>■ {standard}</p>) : <p>暂未提取到测试标准，可手动添加</p>}</section>}
        {movableAssets}
      </div>
    );
  }

  return (
    <div className="leaflet-page leaflet-page-1">
      <img className="leaflet-bg" src={templateSeed.background} alt="康高特彩页固定背景" />
      <div className="leaflet-series">— {product.name} —</div>
      <div
        className={`leaflet-title-band ${selectedLayer === "产品标题" ? "selected-object" : ""}`}
        style={{ color: titleColor, fontSize: `${titleSize / 10}cqw`, transform: `translate(${titleTransform.x}px, ${titleTransform.y}px)` }}
        onPointerDown={(event) => beginTextDrag("产品标题", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}
      >
        {product.displayName}
      </div>
      <img
        className={`leaflet-product ${editable ? "draggable-product" : ""} ${selectedLayer === "产品主图" ? "selected-object" : ""}`}
        src={product.images[0]}
        alt={`${product.model} ${product.displayName}`}
        style={{ transform: `translate(${imageX}px, ${imageY}px) scale(${imageScale / 100})` }}
        draggable={false}
        onPointerDown={beginProductDrag}
        onPointerMove={moveProduct}
        onPointerUp={endProductDrag}
        onPointerCancel={endProductDrag}
      />
      {pageAssignments["产品介绍"] === 1 && <section className={`leaflet-intro draggable-text ${selectedLayer === "产品介绍" ? "selected-object" : ""}`} style={textStyle("产品介绍")} onPointerDown={(event) => beginTextDrag("产品介绍", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>
        <h2 style={headingStyle("产品介绍")}>产品功能</h2>
        <p style={paragraphStyle("产品介绍")}>{product.summary}</p>
      </section>}
      {pageAssignments["核心卖点"] === 1 && <section className={`leaflet-features draggable-text ${selectedLayer === "核心卖点" ? "selected-object" : ""}`} style={textStyle("核心卖点")} onPointerDown={(event) => beginTextDrag("核心卖点", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>
        <h2 style={headingStyle("核心卖点")}>产品特点</h2>
        {product.features.map((feature) => <p key={feature} style={paragraphStyle("核心卖点")}>■ {feature}</p>)}
      </section>}
      {pageAssignments["被测对象"] === 1 && <section className={`leaflet-targets draggable-text ${selectedLayer === "被测对象" ? "selected-object" : ""}`} style={textStyle("被测对象")} onPointerDown={(event) => beginTextDrag("被测对象", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>
        <h2 style={headingStyle("被测对象")}>被测物</h2><p style={paragraphStyle("被测对象")}>{product.targets}</p>
      </section>}
      {pageAssignments["应用领域"] === 1 && <section className={`leaflet-applications draggable-text ${selectedLayer === "应用领域" ? "selected-object" : ""}`} style={textStyle("应用领域")} onPointerDown={(event) => beginTextDrag("应用领域", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>
        <h2 style={headingStyle("应用领域")}>应用领域</h2><p style={paragraphStyle("应用领域")}>{product.applications.map((item) => `■ ${item}`).join("　")}</p>
      </section>}
      {pageAssignments["测试标准"] === 1 && <section className={`standards-section standards-page-one draggable-text ${selectedLayer === "测试标准" ? "selected-object" : ""}`} style={textStyle("测试标准")} onPointerDown={(event) => beginTextDrag("测试标准", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>测试标准</h2>{standards.length ? standards.map((standard, index) => <p key={`${standard}-${index}`}>■ {standard}</p>) : <p>暂未提取到测试标准，可手动添加</p>}</section>}
      {pageAssignments["参数表"] === 1 && <section className={`parameter-section parameter-page-one draggable-text ${selectedLayer === "参数表" ? "selected-object" : ""}`} style={textStyle("参数表")} onPointerDown={(event) => beginTextDrag("参数表", event)} onPointerMove={moveText} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}><h2>技术参数</h2><table><tbody>{product.parameters.map(([key, value], index) => <tr key={`${key}-${index}`}><td>{key}</td><td>{value}</td></tr>)}</tbody></table></section>}
      {movableAssets}
      {editable && selectedLayer && <span className="object-label">{selectedLayer}</span>}
    </div>
  );
}

function Placeholder({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">✦</div>
      <h1>{title}</h1>
      <p>该功能入口已保留，将在彩页链路验证完成后继续建设。</p>
      <button className="secondary-button" onClick={onBack}>返回首页</button>
    </section>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [placeholderTitle, setPlaceholderTitle] = useState("功能规划中");
  const [product, setProduct] = useState<Product>(productSeed);
  const [productQuery, setProductQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("草稿");
  const [selectedProductId, setSelectedProductId] = useState(productSeed.id);
  const [selectedTemplate, setSelectedTemplate] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLayer, setSelectedLayer] = useState("产品标题");
  const [imageScale, setImageScale] = useState(100);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [titleSize, setTitleSize] = useState(42);
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [textStyles, setTextStyles] = useState<Record<string, TextLayerStyle>>(defaultTextStyles);
  const [pageAssignments, setPageAssignments] = useState<Record<string, PageNumber>>({ "产品介绍": 1, "核心卖点": 1, "被测对象": 1, "应用领域": 1, "测试标准": 2, "参数表": 2 });
  const [standards, setStandards] = useState<string[]>(standardsByProduct[productSeed.id] ?? []);
  const [freeImages, setFreeImages] = useState<FreeImage[]>([]);
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);
  const [posterType, setPosterType] = useState<PosterType>("solar");
  const [selectedPosterId, setSelectedPosterId] = useState("solar-qingming");
  const [posterFilter, setPosterFilter] = useState<"all" | PosterType>("all");
  const [posterLayer, setPosterLayer] = useState("标题文字");
  const [posterTitle, setPosterTitle] = useState("清明时节");
  const [posterSubtitle, setPosterSubtitle] = useState("文明祭祀新风尚 · 平安清明共守护");
  const [posterTitleSize, setPosterTitleSize] = useState(72);
  const [posterTitleColor, setPosterTitleColor] = useState("#174f4d");
  const [posterTitleX, setPosterTitleX] = useState(0);
  const [posterTitleY, setPosterTitleY] = useState(0);
  const [posterZoom, setPosterZoom] = useState(75);
  const [posterPreviewOpen, setPosterPreviewOpen] = useState(false);
  const [posterCustomSrc, setPosterCustomSrc] = useState("");
  const [videoCategory, setVideoCategory] = useState<VideoCategory>("exhibition");
  const [videoFilter, setVideoFilter] = useState<"all" | VideoCategory>("all");
  const [videoCreateStep, setVideoCreateStep] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [qaProductId, setQaProductId] = useState(productSeed.id);
  const [qaInput, setQaInput] = useState("");
  const [qaListening, setQaListening] = useState(false);
  const [designWorkflowStatus, setDesignWorkflowStatus] = useState<DesignWorkflowStatus>("设计制作中");
  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>(materialLibraryAssets);
  const [libraryFilter, setLibraryFilter] = useState<"all" | LibraryCategory>("all");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [selectedLibraryAssetId, setSelectedLibraryAssetId] = useState("pld-leaflet");
  const [libraryPreviewOpen, setLibraryPreviewOpen] = useState(false);
  const [knowledgeView, setKnowledgeView] = useState<KnowledgeView>("overview");
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [brandKnowledgeItems, setBrandKnowledgeItems] = useState<BrandKnowledgeItem[]>([
    { id: "brand-profile", title: "品牌介绍", description: "企业定位、发展历程与对外统一介绍", icon: "⚑", status: "已启用" },
    { id: "brand-logo", title: "Logo 规范", description: "标准 Logo、反白版本与安全使用范围", icon: "LOGO", status: "已启用" },
    { id: "brand-visual", title: "标准色与字体", description: "企业标准色、辅助色与品牌字体规范", icon: "T", status: "已启用" },
    { id: "brand-copy", title: "品牌话术", description: "品牌主张、标准称谓与常用传播表达", icon: "•••", status: "已启用" },
    { id: "company-profile", title: "企业介绍", description: "用于彩页、展会与视频的企业介绍内容", icon: "▤", status: "已启用" },
    { id: "brand-contact", title: "二维码与联系方式", description: "企业二维码、官网与统一联系信息", icon: "▦", status: "已启用" },
  ]);
  const [productKnowledgeItems, setProductKnowledgeItems] = useState<ProductKnowledgeItem[]>(() => productCatalog.map((item) => ({
    id: item.id,
    model: item.model,
    name: item.displayName,
    image: item.images[0],
    sourceCount: item.sources.length,
    status: "已启用",
  })));
  const [qaMessages, setQaMessages] = useState<QaMessage[]>([
    { id: "welcome", role: "assistant", content: "你好，我是 Kiti。今天想问什么产品？你可以直接告诉我产品名称或型号。" },
  ]);
  const [toast, setToast] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>(["已根据知识库资料生成双页彩页初稿"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const posterDragRef = useRef<{ x: number; y: number } | null>(null);
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("kgt-leaflet-mvp");
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.product) setProduct(saved.product);
      if (saved.status) setStatus(saved.status);
      if (saved.imageScale) setImageScale(saved.imageScale);
      if (typeof saved.imageX === "number") setImageX(saved.imageX);
      if (typeof saved.imageY === "number") setImageY(saved.imageY);
      if (saved.titleSize) setTitleSize(saved.titleSize);
      if (saved.titleColor) setTitleColor(saved.titleColor);
      if (saved.textStyles) setTextStyles({ ...defaultTextStyles, ...saved.textStyles });
      if (saved.pageAssignments) setPageAssignments((previous) => ({ ...previous, ...saved.pageAssignments }));
      if (saved.standards) setStandards(saved.standards);
      if (saved.freeImages) setFreeImages(saved.freeImages);
      if (saved.customTexts) setCustomTexts(saved.customTexts);
      if (["设计制作中", "AI审核中", "待业务确认", "已归档"].includes(saved.designWorkflowStatus)) setDesignWorkflowStatus(saved.designWorkflowStatus);
      if (Array.isArray(saved.libraryAssets) && saved.libraryAssets.length) setLibraryAssets(saved.libraryAssets);
    } catch {
      window.localStorage.removeItem("kgt-leaflet-mvp");
    }
  }, []);

  const projectProgress = useMemo(() => status === "已通过" ? 100 : status === "待审核" ? 90 : 72, [status]);
  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return productCatalog;
    return productCatalog.filter((item) => [item.model, item.name, item.displayName, item.category].some((value) => value.toLowerCase().includes(query)));
  }, [productQuery]);
  const layers = useMemo(() => [
    ...baseLayers.map((label) => ({ id: label, label })),
    ...customTexts.map((item) => ({ id: `custom:${item.id}`, label: item.title || "自定义文字" })),
    ...freeImages.map((item) => ({ id: `image:${item.id}`, label: item.name || "图片素材" })),
  ], [customTexts, freeImages]);
  const selectedCustomText = selectedLayer.startsWith("custom:") ? customTexts.find((item) => item.id === selectedLayer.slice(7)) : undefined;
  const selectedFreeImage = selectedLayer.startsWith("image:") ? freeImages.find((item) => item.id === selectedLayer.slice(6)) : undefined;
  const selectedPoster = posterTemplates.find((item) => item.id === selectedPosterId) ?? posterTemplates[0];
  const posterCanvasSrc = posterCustomSrc || selectedPoster.src;
  const filteredPosterTemplates = posterTemplates.filter((item) => posterFilter === "all" || item.type === posterFilter);
  const qaProduct = productCatalog.find((item) => item.id === qaProductId) ?? productCatalog[0];
  const filteredLibraryAssets = libraryAssets.filter((item) => {
    const query = libraryQuery.trim().toLowerCase();
    const matchesCategory = libraryFilter === "all" || item.category === libraryFilter;
    const matchesQuery = !query || [item.name, item.categoryLabel, item.source, ...item.tags].some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });
  const selectedLibraryAsset = libraryAssets.find((item) => item.id === selectedLibraryAssetId) ?? libraryAssets[0];

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function addBrandKnowledge() {
    const title = window.prompt("请输入新的品牌内容名称，例如：展会品牌规范");
    if (!title?.trim()) return;
    const description = window.prompt("请输入内容说明", "新的企业品牌规范内容")?.trim() || "新的企业品牌规范内容";
    setBrandKnowledgeItems((items) => [...items, { id: `brand-${Date.now()}`, title: title.trim(), description, icon: "＋", status: "已启用" }]);
    setKnowledgeView("brand");
    notify(`已新增品牌内容：${title.trim()}`);
  }

  function addProductKnowledge() {
    const model = window.prompt("请输入产品型号");
    if (!model?.trim()) return;
    const name = window.prompt("请输入产品名称");
    if (!name?.trim()) return;
    setProductKnowledgeItems((items) => [...items, { id: `product-${Date.now()}`, model: model.trim(), name: name.trim(), image: "/assets/products/pld-11/front.png", sourceCount: 0, status: "已启用" }]);
    setKnowledgeView("products");
    notify(`已新建产品档案：${model.trim()} ${name.trim()}`);
  }

  function editBrandKnowledge(item: BrandKnowledgeItem) {
    const title = window.prompt("修改内容名称", item.title);
    if (!title?.trim()) return;
    const description = window.prompt("修改内容说明", item.description)?.trim() || item.description;
    setBrandKnowledgeItems((items) => items.map((entry) => entry.id === item.id ? { ...entry, title: title.trim(), description } : entry));
    notify("品牌内容已更新");
  }

  function toggleBrandKnowledge(item: BrandKnowledgeItem) {
    const nextStatus: KnowledgeItemStatus = item.status === "已启用" ? "已停用" : "已启用";
    setBrandKnowledgeItems((items) => items.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus } : entry));
    notify(`${item.title}已${nextStatus === "已启用" ? "恢复" : "停用"}`);
  }

  function deleteBrandKnowledge(item: BrandKnowledgeItem) {
    if (!window.confirm(`确定删除“${item.title}”吗？本地演示数据删除后可刷新页面恢复。`)) return;
    setBrandKnowledgeItems((items) => items.filter((entry) => entry.id !== item.id));
    notify(`${item.title}已删除`);
  }

  function toggleProductKnowledge(item: ProductKnowledgeItem) {
    const nextStatus: KnowledgeItemStatus = item.status === "已启用" ? "已停用" : "已启用";
    setProductKnowledgeItems((items) => items.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus } : entry));
    notify(`${item.model} 已${nextStatus === "已启用" ? "恢复" : "归档"}`);
  }

  function deleteProductKnowledge(item: ProductKnowledgeItem) {
    if (!window.confirm(`确定删除“${item.model} ${item.name}”吗？本地演示数据删除后可刷新页面恢复。`)) return;
    setProductKnowledgeItems((items) => items.filter((entry) => entry.id !== item.id));
    notify(`${item.model} 产品档案已删除`);
  }

  function persist(nextStatus = status, workflowStatus = designWorkflowStatus, assets = libraryAssets) {
    window.localStorage.setItem("kgt-leaflet-mvp", JSON.stringify({ product, status: nextStatus, imageScale, imageX, imageY, titleSize, titleColor, textStyles, pageAssignments, standards, freeImages, customTexts, designWorkflowStatus: workflowStatus, libraryAssets: assets }));
  }

  function saveDraft() {
    setStatus("草稿");
    persist("草稿");
    notify("草稿已保存到本机");
  }

  function submitReview() {
    setStatus("待审核");
    setDesignWorkflowStatus("AI审核中");
    persist("待审核", "AI审核中");
    setScreen("team");
    notify("设计稿已提交，正在执行 AI 规则预审（演示）");
    window.setTimeout(() => {
      setDesignWorkflowStatus("待业务确认");
      persist("待审核", "待业务确认");
      notify("规则预审通过，已流转给业务负责人确认");
    }, 1200);
  }

  function approve() {
    setStatus("已通过");
    persist("已通过");
    notify("审核已通过，可以导出");
  }

  function handleNav(key: string, label: string) {
    if (key === "home") setScreen("home");
    else if (key === "materials") setScreen("materials");
    else if (key === "video") setScreen("video-home");
    else if (key === "qa") setScreen("qa");
    else if (key === "team") setScreen("team");
    else if (key === "assets") setScreen("assets");
    else if (key === "knowledge") { setKnowledgeView("overview"); setScreen("knowledge"); }
    else if (key === "admin") setScreen("admin");
    else if (key === "projects") setScreen("projects");
    else {
      setPlaceholderTitle(label);
      setScreen("placeholder");
    }
  }

  function buildQaAnswer(question: string, selected: Product) {
    const normalized = question.toLowerCase();
    const detected = productCatalog.find((item) => [item.model, item.name, item.displayName].some((value) => normalized.includes(value.toLowerCase()))) ?? selected;
    if (detected.id !== qaProductId) setQaProductId(detected.id);
    const name = `${detected.model} ${detected.displayName}`;
    const sources = detected.sources.slice(0, 3).map((item) => item.name);
    if (/区别|对比|其他型号|差异/.test(normalized)) {
      const others = productCatalog.filter((item) => item.id !== detected.id).map((item) => `${item.model} ${item.displayName}主要用于${item.targets}`).join("；");
      return { content: `${name}属于${detected.category}，核心使用场景是${detected.targets}。与另外两款产品相比，它解决的是不同检测任务：${others}。因此选型时应先确认被测对象和检测目标，而不是只比较参数。`, sources };
    }
    if (/竞争力|卖点|优势|特点/.test(normalized)) {
      return { content: `${name}的核心卖点包括：\n${detected.features.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n这些能力让产品在现场检测中兼顾操作效率、结果判断和数据留存。`, sources };
    }
    if (/检测哪些|被测|对象|测什么|适用/.test(normalized)) {
      return { content: `${name}可用于检测：${detected.targets}。典型应用领域包括${detected.applications.join("、")}。`, sources };
    }
    if (/参数|频率|续航|尺寸|通信|防护/.test(normalized)) {
      return { content: `${name}的部分关键参数如下：\n${detected.parameters.slice(0, 8).map(([key, value]) => `• ${key}：${value}`).join("\n")}\n如需某一项完整参数，可以继续告诉我参数名称。`, sources };
    }
    if (/功能|是什么|介绍|产品/.test(normalized)) {
      return { content: `${name}是一款${detected.category}，${detected.positioning}。${detected.summary}\n\n核心功能：${detected.features.join("；")}\n\n核心卖点：操作更简单、现场定位与判断更高效，检测数据能够保存并用于后续分析。`, sources };
    }
    return { content: `当前演示资料中没有找到这个问题的明确答案。你可以继续询问 ${name} 的产品功能、核心卖点、技术参数、适用对象，或者与其他型号的区别。`, sources };
  }

  function sendQaMessage(text = qaInput) {
    const question = text.trim();
    if (!question) return;
    const answer = buildQaAnswer(question, qaProduct);
    const stamp = Date.now();
    setQaMessages((messages) => [...messages,
      { id: `user-${stamp}`, role: "user", content: question },
      { id: `assistant-${stamp}`, role: "assistant", content: answer.content, sources: answer.sources },
    ]);
    setQaInput("");
  }

  function startQaVoiceInput() {
    const SpeechRecognition = (window as typeof window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition
      ?? (window as typeof window & { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!SpeechRecognition) return notify("当前浏览器不支持语音识别，请使用 Chrome 或 Edge");
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setQaListening(true);
    recognition.onend = () => setQaListening(false);
    recognition.onerror = () => { setQaListening(false); notify("没有识别到语音，请检查麦克风权限后重试"); };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setQaInput(transcript);
      if (transcript) window.setTimeout(() => sendQaMessage(transcript), 120);
    };
    recognition.start();
  }

  function submitDesignForAiReview() {
    if (designWorkflowStatus !== "设计制作中") return;
    setDesignWorkflowStatus("AI审核中");
    persist(status, "AI审核中");
    notify("设计稿已提交，AI 正在检查型号参数与品牌规范");
    window.setTimeout(() => {
      setDesignWorkflowStatus("待业务确认");
      persist(status, "待业务确认");
      notify("AI 审核通过，已流转给业务负责人王琳");
    }, 1200);
  }

  function confirmBusinessAndArchive() {
    if (designWorkflowStatus !== "待业务确认") return;
    const archiveId = "archived-pld-11-leaflet";
    const archivedAsset: LibraryAsset = {
      id: archiveId,
      name: "PLD-11 智能数字听漏仪双页彩页 · 业务确认版",
      category: "leaflet",
      categoryLabel: "产品宣传彩页",
      files: ["/assets/templates/leaflet/preview-page-1.png", "/assets/templates/leaflet/preview-page-2.png"],
      source: "团队空间业务确认后自动归档（演示）",
      tags: ["PLD-11", "业务确认", "自动归档"],
    };
    const nextAssets = libraryAssets.some((item) => item.id === archiveId)
      ? libraryAssets.map((item) => item.id === archiveId ? archivedAsset : item)
      : [archivedAsset, ...libraryAssets];
    setLibraryAssets(nextAssets);
    setDesignWorkflowStatus("已归档");
    setStatus("已通过");
    setSelectedLibraryAssetId(archiveId);
    setLibraryFilter("leaflet");
    persist("已通过", "已归档", nextAssets);
    notify("业务负责人已确认，正式版本已自动归档到素材库");
    window.setTimeout(() => setScreen("assets"), 900);
  }

  function resetWorkflowDemo() {
    const nextAssets = libraryAssets.filter((item) => item.id !== "archived-pld-11-leaflet");
    setLibraryAssets(nextAssets);
    setDesignWorkflowStatus("设计制作中");
    setStatus("草稿");
    setSelectedLibraryAssetId("pld-leaflet");
    persist("草稿", "设计制作中", nextAssets);
    notify("协作演示流程已重置，可以重新体验");
  }

  function downloadLibraryFile(src: string, assetName: string, index: number) {
    const extension = src.split(".").pop()?.split("?")[0] ?? "png";
    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.download = `${assetName}${index > 0 ? `-${index + 1}` : ""}.${extension}`;
    anchor.click();
    notify(`${assetName}${index > 0 ? ` 第${index + 1}页` : ""}已开始下载`);
  }

  function updateFeature(index: number, value: string) {
    setProduct((previous) => ({ ...previous, features: previous.features.map((item, itemIndex) => itemIndex === index ? value : item) }));
  }

  function updateParameter(index: number, key: string, value: string) {
    setProduct((previous) => ({ ...previous, parameters: previous.parameters.map((row, rowIndex) => rowIndex === index ? [key, value] : row) }));
  }

  function updateTextStyle(layer: string, patch: Partial<TextLayerStyle>) {
    setTextStyles((previous) => ({ ...previous, [layer]: { ...(previous[layer] ?? defaultTextStyles[layer]), ...patch } }));
  }

  function moveTextLayer(layer: string, deltaX: number, deltaY: number) {
    if (layer.startsWith("custom:")) {
      const id = layer.slice(7);
      setCustomTexts((items) => items.map((item) => item.id === id ? { ...item, x: Math.max(1, Math.min(82, item.x + deltaX / 5)), y: Math.max(11, Math.min(88, item.y + deltaY / 7)) } : item));
      return;
    }
    updateTextStyle(layer, {
      x: Math.max(-120, Math.min(120, (textStyles[layer]?.x ?? 0) + deltaX)),
      y: Math.max(-120, Math.min(120, (textStyles[layer]?.y ?? 0) + deltaY)),
    });
  }

  function chooseProduct(nextProduct: Product) {
    setProduct({ ...nextProduct, features: [...nextProduct.features], applications: [...nextProduct.applications], images: [...nextProduct.images], screens: [...nextProduct.screens], sources: [...nextProduct.sources], parameters: nextProduct.parameters.map((row) => [...row]) });
    setSelectedProductId(nextProduct.id);
    setImageScale(100);
    setImageX(0);
    setImageY(0);
    setStandards(standardsByProduct[nextProduct.id] ?? []);
    setFreeImages([]);
    setCustomTexts([]);
  }

  function makePrimaryImage(index: number) {
    if (index === 0) return;
    setProduct((previous) => ({ ...previous, images: [previous.images[index], ...previous.images.filter((_, imageIndex) => imageIndex !== index)] }));
    notify("已切换产品主图");
  }

  function uploadProductImage(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProduct((previous) => ({ ...previous, images: [String(reader.result), ...previous.images.slice(1)] }));
      notify("产品主图已替换");
    };
    reader.readAsDataURL(file);
  }

  function addRecommendedImage(src: string, name: string, category: string) {
    const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setFreeImages((items) => [...items, { id, src, name, category, page: currentPage as PageNumber, x: 52, y: 42, width: 38 }]);
    setSelectedLayer(`image:${id}`);
    notify(`${category}已添加到第 ${currentPage} 页`);
  }

  function uploadFreeImage(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addRecommendedImage(String(reader.result), file.name, "用户上传");
    reader.readAsDataURL(file);
  }

  function moveFreeImage(id: string, deltaX: number, deltaY: number) {
    setFreeImages((items) => items.map((item) => item.id === id ? { ...item, x: Math.max(1, Math.min(88, item.x + deltaX / 5)), y: Math.max(11, Math.min(88, item.y + deltaY / 7)) } : item));
  }

  function addCustomText() {
    const id = `text-${Date.now()}`;
    setCustomTexts((items) => [...items, { id, title: "自定义标题", content: "点击右侧输入需要补充的文字内容", page: currentPage as PageNumber, x: 8, y: 62, width: 40, fontSize: 1.6, fontWeight: 400 }]);
    setSelectedLayer(`custom:${id}`);
    notify(`已在第 ${currentPage} 页添加文字`);
  }

  function moveLayerToPage(layer: string, page: PageNumber) {
    if (layer.startsWith("custom:")) setCustomTexts((items) => items.map((item) => item.id === layer.slice(7) ? { ...item, page } : item));
    else setPageAssignments((previous) => ({ ...previous, [layer]: page }));
    setCurrentPage(page);
    notify(`已移动到第 ${page} 页`);
  }

  function addParameter() {
    setProduct((previous) => ({ ...previous, parameters: [...previous.parameters, ["新增参数", "请输入参数说明"]] }));
  }

  function deleteParameter(index: number) {
    setProduct((previous) => ({ ...previous, parameters: previous.parameters.filter((_, rowIndex) => rowIndex !== index) }));
  }

  function extractLeafletContent() {
    setChatHistory((history) => [...history, `已从当前产品说明书及 ${referenceLeaflets.length} 份历史彩页提取：产品功能、产品特点、被测对象、应用领域`]);
    setSelectedLayer("产品介绍");
    notify("已提取彩页文案，可在右侧继续修改并拖动排版");
  }

  function runAssistant() {
    const command = assistantInput.trim();
    if (!command) return;
    if (command.includes("放大")) setImageScale((value) => Math.min(140, value + 10));
    if (command.includes("缩小")) setImageScale((value) => Math.max(60, value - 10));
    if (command.includes("向上")) setImageY((value) => value - 8);
    if (command.includes("向下")) setImageY((value) => value + 8);
    if (command.includes("标题") && command.includes("蓝")) setTitleColor("#dff3ff");
    setChatHistory((history) => [...history, command]);
    setAssistantInput("");
    notify("已执行修改指令");
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const characters = [...text];
    let line = "";
    let currentY = y;
    characters.forEach((character) => {
      const test = line + character;
      if (context.measureText(test).width > maxWidth && line) {
        context.fillText(line, x, currentY);
        line = character;
        currentY += lineHeight;
      } else line = test;
    });
    if (line) context.fillText(line, x, currentY);
    return currentY;
  }

  async function drawExportPage(page: PageNumber) {
    const canvas = document.createElement("canvas");
    canvas.width = 1240;
    canvas.height = 1754;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    const background = await loadImage(templateSeed.background);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.font = "700 44px 'Alibaba PuHuiTi', sans-serif";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.fillText(`— ${product.name} —`, 385, 122);
    context.font = `700 ${Math.max(30, titleSize)}px 'Alibaba PuHuiTi', sans-serif`;
    context.fillStyle = titleColor;
    context.fillText(product.displayName, 910 + (textStyles["产品标题"]?.x ?? 0) * 2, 172 + (textStyles["产品标题"]?.y ?? 0) * 2);
    context.textAlign = "left";
    context.fillStyle = "#206ca5";

    if (page === 1) {
      const productImage = await loadImage(product.images[0]);
      const productWidth = 520 * imageScale / 100;
      const productHeight = productImage.height / productImage.width * productWidth;
      context.drawImage(productImage, 30 + imageX, 180 + imageY, productWidth, productHeight);
    }

    const drawSection = (title: string, body: string, x: number, y: number, width: number) => {
      context.font = "700 31px 'Alibaba PuHuiTi', sans-serif";
      context.fillStyle = "#206ca5";
      context.fillText(title, x, y);
      context.font = "20px 'Alibaba PuHuiTi', sans-serif";
      context.fillStyle = "#1d2b38";
      wrapText(context, body, x, y + 44, width, 32);
    };
    const sectionPositions = page === 1 ? { intro: [570, 320, 590], features: [45, 650, 520], targets: [45, 1190, 500], applications: [45, 1380, 1080] } : { intro: [100, 285, 1030], features: [100, 560, 1030], targets: [100, 1030, 1030], applications: [100, 1190, 1030] };
    if (pageAssignments["产品介绍"] === page) drawSection("产品功能", product.summary, ...sectionPositions.intro as [number, number, number]);
    if (pageAssignments["核心卖点"] === page) drawSection("产品特点", product.features.map((item) => `■ ${item}`).join("\n"), ...sectionPositions.features as [number, number, number]);
    if (pageAssignments["被测对象"] === page) drawSection("被测物", product.targets, ...sectionPositions.targets as [number, number, number]);
    if (pageAssignments["应用领域"] === page) drawSection("应用领域", product.applications.map((item) => `■ ${item}`).join("　"), ...sectionPositions.applications as [number, number, number]);

    if (pageAssignments["参数表"] === page) {
      context.font = "700 36px 'Alibaba PuHuiTi', sans-serif";
      context.fillText("技术参数", 120, 290);
      const startX = 120, startY = 330, rowHeight = Math.max(42, Math.min(68, 900 / Math.max(product.parameters.length, 1))), firstWidth = 300, secondWidth = 700;
      context.font = `${Math.max(15, Math.min(20, rowHeight * .36))}px 'Alibaba PuHuiTi', sans-serif`;
      product.parameters.forEach(([key, value], index) => {
        const y = startY + index * rowHeight;
        context.strokeStyle = "#75818c";
        context.strokeRect(startX, y, firstWidth, rowHeight);
        context.strokeRect(startX + firstWidth, y, secondWidth, rowHeight);
        context.fillStyle = index === 0 ? "#e9f6fb" : "#ffffff";
        context.fillRect(startX + 1, y + 1, firstWidth - 2, rowHeight - 2);
        context.fillRect(startX + firstWidth + 1, y + 1, secondWidth - 2, rowHeight - 2);
        context.fillStyle = "#253342";
        context.fillText(key, startX + 18, y + rowHeight * .64);
        context.fillText(value, startX + firstWidth + 18, y + rowHeight * .64);
      });
    }
    if (pageAssignments["测试标准"] === page) drawSection("测试标准", standards.length ? standards.map((item) => `■ ${item}`).join("\n") : "暂未提取到测试标准，可手动添加", 110, page === 2 ? 1360 : 1120, 1020);

    for (const item of freeImages.filter((image) => image.page === page)) {
      try {
        const asset = await loadImage(item.src);
        const width = canvas.width * item.width / 100;
        const height = asset.height / asset.width * width;
        context.drawImage(asset, canvas.width * item.x / 100, canvas.height * item.y / 100, width, height);
      } catch { /* Keep export available if a local temporary image expired. */ }
    }
    customTexts.filter((item) => item.page === page).forEach((item) => {
      context.font = `700 ${Math.max(22, item.fontSize * 15)}px 'Alibaba PuHuiTi', sans-serif`;
      context.fillStyle = "#206ca5";
      context.fillText(item.title, canvas.width * item.x / 100, canvas.height * item.y / 100);
      context.font = `${Math.max(16, item.fontSize * 12)}px 'Alibaba PuHuiTi', sans-serif`;
      context.fillStyle = "#1d2b38";
      wrapText(context, item.content, canvas.width * item.x / 100, canvas.height * item.y / 100 + 36, canvas.width * item.width / 100, 28);
    });
    return canvas;
  }

  async function exportPng() {
    if (status !== "已通过") return notify("审核通过后才能导出");
    notify("正在生成双页高清图片");
    const pageOne = await drawExportPage(1);
    const pageTwo = await drawExportPage(2);
    const gap = 40;
    const output = document.createElement("canvas");
    output.width = pageOne.width;
    output.height = pageOne.height * 2 + gap;
    const context = output.getContext("2d");
    if (!context) return notify("当前浏览器无法生成图片");
    context.fillStyle = "#eef1f6";
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(pageOne, 0, 0);
    context.drawImage(pageTwo, 0, pageOne.height + gap);
    output.toBlob((blob) => {
      if (!blob) {
        notify("图片生成失败，请稍后重试");
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download = `${product.model}-${product.displayName}-双页彩页.png`;
      anchor.href = objectUrl;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      notify("双页彩页已导出");
    }, "image/png");
  }

  function startPoster(type: PosterType) {
    const first = posterTemplates.find((item) => item.type === type) ?? posterTemplates[0];
    setPosterType(type);
    setPosterFilter(type);
    setSelectedPosterId(first.id);
    setPosterCustomSrc("");
    setScreen("poster-templates");
  }

  function usePosterTemplate(template: PosterTemplate) {
    setPosterType(template.type);
    setSelectedPosterId(template.id);
    setPosterCustomSrc("");
    if (template.type === "solar") {
      setPosterTitle(template.name.replace(" · ", "\n"));
      setPosterSubtitle("节气有时 · 美好常在");
      setPosterTitleColor("#174f4d");
    } else {
      setPosterTitle(template.name);
      setPosterSubtitle("精准检测 · 高效可靠 · 服务现场");
      setPosterTitleColor("#ffffff");
    }
    setScreen("poster-editor");
  }

  function uploadPosterAsset(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPosterCustomSrc(String(reader.result));
      setPosterLayer("背景");
      notify("图片已添加到海报画布");
    };
    reader.readAsDataURL(file);
  }

  function beginPosterTitleDrag(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    posterDragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePosterTitle(event: ReactPointerEvent<HTMLDivElement>) {
    const previousPointer = posterDragRef.current;
    if (!previousPointer) return;
    const deltaX = event.clientX - previousPointer.x;
    const deltaY = event.clientY - previousPointer.y;
    posterDragRef.current = { x: event.clientX, y: event.clientY };
    setPosterTitleX((value) => Math.max(-180, Math.min(180, value + deltaX)));
    setPosterTitleY((value) => Math.max(-260, Math.min(360, value + deltaY)));
  }

  function endPosterTitleDrag(event: ReactPointerEvent<HTMLDivElement>) {
    posterDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function exportPosterPng() {
    try {
      const image = await loadImage(posterCanvasSrc);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) return notify("当前浏览器无法生成海报");
      context.drawImage(image, 0, 0);
      const scale = canvas.width / 750;
      context.textAlign = "center";
      context.fillStyle = posterTitleColor;
      context.font = `700 ${posterTitleSize * scale}px 'Alibaba PuHuiTi', sans-serif`;
      const titleLines = posterTitle.split("\n");
      titleLines.forEach((line, index) => context.fillText(line, canvas.width / 2 + posterTitleX * scale, canvas.height * .22 + posterTitleY * scale + index * posterTitleSize * 1.1 * scale));
      context.font = `400 ${Math.max(24, posterTitleSize * .34) * scale}px 'Alibaba PuHuiTi', sans-serif`;
      context.fillText(posterSubtitle, canvas.width / 2 + posterTitleX * scale, canvas.height * .22 + posterTitleY * scale + titleLines.length * posterTitleSize * 1.2 * scale);
      const anchor = document.createElement("a");
      anchor.download = `${selectedPoster.name}-海报.png`;
      anchor.href = canvas.toDataURL("image/png");
      anchor.click();
      notify("海报 PNG 已导出");
    } catch {
      notify("海报导出失败，请检查图片资源");
    }
  }

  const pageHeader = (step: number, title = "创建产品宣传彩页") => (
    <>
      <div className="breadcrumb">平面物料　/　产品宣传彩页　/　新建彩页</div>
      <div className="flow-title-row"><h1>{title}</h1>{step < 4 && <span className="autosave">● 本地资料已载入</span>}</div>
      <Stepper step={step} />
    </>
  );

  function handleLandingPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const element = landingRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    element.style.setProperty("--pointer-x", `${x * 100}%`);
    element.style.setProperty("--pointer-y", `${y * 100}%`);
    element.style.setProperty("--drift-x", `${(x - .5) * -28}px`);
    element.style.setProperty("--drift-y", `${(y - .5) * -20}px`);
    element.style.setProperty("--glass-x", `${(x - .5) * 34}px`);
    element.style.setProperty("--glass-y", `${(y - .5) * 22}px`);
  }

  function resetLandingPointer() {
    const element = landingRef.current;
    if (!element) return;
    element.style.setProperty("--pointer-x", "72%");
    element.style.setProperty("--pointer-y", "28%");
    element.style.setProperty("--drift-x", "0px");
    element.style.setProperty("--drift-y", "0px");
    element.style.setProperty("--glass-x", "0px");
    element.style.setProperty("--glass-y", "0px");
  }

  function renderLanding() {
    return (
      <main ref={landingRef} className="brand-landing" onPointerMove={handleLandingPointerMove} onPointerLeave={resetLandingPointer}>
        <div className="brand-landing-background" aria-hidden="true"><div className="brand-landing-image" /><div className="brand-landing-ribbons" /><div className="brand-landing-light" /></div>
        <section className="brand-landing-content">
          <p className="brand-landing-label">ENTERPRISE AIGC PLATFORM</p>
          <h1><span>让产品资料</span><span>一键变成营销内容</span></h1>
          <button className="brand-enter-button" onClick={() => setScreen("home")}>
            <span className="brand-enter-roll"><span>进入工作台</span><span>进入工作台</span></span><i>→</i>
          </button>
          <p className="brand-landing-trust"><span>✓</span>产品资料仅在企业内部使用 · 生成内容需人工审核</p>
        </section>
      </main>
    );
  }

  function renderHome() {
    return (
      <div className="home-page">
        <section className="hero">
          <p className="eyebrow">KANGGAOTE · AI MARKETING STUDIO</p>
          <h1>让产品资料，一键变成营销内容</h1>
          <p>基于企业知识库，生成准确、统一、可审核的平面物料，并支持宣传视频与产品问答。</p>
          <div className="hero-prompt">
            <span className="prompt-placeholder">描述你的任务，例如：为“大海 PLD-11 智能数字听漏仪”制作一份双页产品彩页……</span>
            <div className="prompt-tools">
              <button onClick={() => notify("可添加产品说明书、图片或历史彩页")}>＋ 添加资料</button>
              <button onClick={() => setScreen("select")}>▣ 选择产品</button>
              <button onClick={() => setScreen("template")}>▤ 选择模板</button>
              <button className="voice-button" aria-label="进入产品问答使用语音输入" onClick={() => setScreen("qa")}>◉</button>
            </div>
            <button className="prompt-send" onClick={() => setScreen("select")}>➤ 开始制作</button>
          </div>
          <div className="data-safe">✓ 产品资料仅在本机使用 · 生成内容需人工审核</div>
        </section>
        <section className="capability-grid">
          <button className="capability-card active-capability" onClick={() => setScreen("materials")}>
            <span className="capability-icon">▦</span><strong>平面物料</strong><small>海报、说明书、彩页与展会物料</small><em>彩页链路可用 →</em>
          </button>
          <button className="capability-card" onClick={() => setScreen("video-home")}>
            <span className="capability-icon">▶</span><strong>宣传视频</strong><small>培训课程、展会讲解与产品营销视频</small><em>视频中心可用 →</em>
          </button>
          <button className="capability-card" onClick={() => setScreen("qa")}>
            <span className="capability-icon green">✦</span><strong>产品问答</strong><small>基于三款产品资料进行智能问答</small><em>问答功能可用 →</em>
          </button>
        </section>
        <section className="home-section">
          <div className="section-title"><div><h2>推荐工具</h2><p>从常用任务快速开始</p></div></div>
          <div className="tool-grid">
            {["卖点提炼", "营销文案", "商品抠图", "场景换背景", "彩页生成", "产品问答"].map((tool, index) => <button key={tool} onClick={() => index === 4 ? setScreen("select") : index === 5 ? setScreen("qa") : notify(`${tool}将在后续版本开放`)}><span>{["✦", "文", "◒", "▧", "▤", "?"][index]}</span><b>{tool}</b><small>{index === 4 ? "使用真实双页模板" : index === 5 ? "三个产品资料已接入" : "后续建设"}</small></button>)}
          </div>
        </section>
        <section className="home-section">
          <div className="section-title"><div><h2>我的工作</h2><p>继续处理最近项目与审核任务</p></div><button className="text-button" onClick={() => setScreen("projects")}>查看全部 →</button></div>
          <div className="recent-card" onClick={() => setScreen(status === "草稿" ? "edit" : "projects")}>
            <img src={product.images[0]} alt="大海智能数字听漏仪" />
            <div><strong>PLD-11 大海智能数字听漏仪彩页</strong><span>双页A4 · 康高特科技蓝模板</span></div>
            <StatusPill status={status} />
            <div className="progress"><i style={{ width: `${projectProgress}%` }} /></div>
          </div>
        </section>
      </div>
    );
  }

  function renderMaterials() {
    return (
      <div className="content-page">
        <div className="breadcrumb">首页　/　平面物料</div>
        <div className="page-title-row"><div><h1>平面物料中心</h1><p>选择物料类型，基于真实产品资料和公司模板快速创建</p></div><button className="primary-button" onClick={() => setScreen("select")}>＋ 创建平面物料</button></div>
        <div className="search-bar">⌕　搜索物料、模板或产品名称</div>
        <h2 className="subheading">选择物料类型</h2>
        <div className="material-grid">
          {materialTypes.map(([name, description, tags], index) => (
            <button key={name} className={["海报", "产品宣传彩页"].includes(name) ? "material-card enabled" : "material-card"} onClick={() => name === "产品宣传彩页" ? setScreen("select") : name === "海报" ? setScreen("poster-home") : notify(`${name}入口已保留，后续开放`)}>
              <span className={`material-visual visual-${index + 1}`}>{["海", "书", "页", "贴", "牌", "展"][index]}</span>
              <div><strong>{name}</strong><p>{description}</p><small>{tags}</small></div>
              {["海报", "产品宣传彩页"].includes(name) && <em>当前可用</em>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function startVideoProject(category: VideoCategory) {
    setVideoCategory(category);
    setVideoCreateStep(1);
    setScreen("video-create");
  }

  function renderVideoHome() {
    const categories: Array<{ id: VideoCategory; title: string; description: string; tags: string[]; image: string }> = [
      { id: "training", title: "内部人员学习", description: "汇集企业已录制的产品教程，供内部人员随时学习", tags: ["使用方法培训", "产品讲解", "课程学习"], image: "/assets/products/pld-11/front.png" },
      { id: "exhibition", title: "展会讲解", description: "生成展台循环播放与销售辅助讲解视频", tags: ["展台循环", "产品演示", "销售讲解"], image: "/assets/posters/product-cannavaro-v2.jpg" },
      { id: "social", title: "社交媒体内容", description: "快速适配短视频与多平台传播内容", tags: ["短视频", "横版宣传", "多尺寸适配"], image: "/assets/products/nezha/main.png" },
      { id: "launch", title: "产品上市", description: "围绕新品、核心卖点与应用场景生成发布视频", tags: ["新品发布", "核心卖点", "应用场景"], image: "/assets/posters/product-houyi.jpg" },
    ];
    const templates = [
      ["产品功能讲解", "02:35", "training", "/assets/products/zhaolu/main.png"],
      ["60秒新品发布", "01:02", "launch", "/assets/posters/product-houyi.jpg"],
      ["展会循环宣传", "01:48", "exhibition", "/assets/posters/product-cannavaro-v2.jpg"],
      ["操作培训课程", "03:12", "training", "/assets/products/pld-11/front.png"],
    ];
    const filteredTemplates = templates.filter((item) => videoFilter === "all" || item[2] === videoFilter);
    const steps = ["选择类型", "添加资料", "生成脚本与分镜", "生成视频素材", "编辑成片", "审核导出"];
    return (
      <div className="video-home-page">
        <div className="breadcrumb">宣传视频　/　视频中心</div>
        <div className="page-title-row"><div><h1>宣传视频中心</h1><p>基于企业产品资料与知识库，快速生成可编辑、可审核的视频内容</p></div><button className="primary-button" onClick={() => startVideoProject("launch")}>＋ 新建视频</button></div>
        <div className="video-flow-strip">{steps.map((step, index) => <div key={step}><span>{index + 1}</span><b>{step}</b>{index < steps.length - 1 && <i />}</div>)}</div>
        <div className="video-entry-grid">{categories.map((item) => <section className="video-entry-card" key={item.id}><div className="video-entry-copy"><h2>{item.title}</h2><p>{item.description}</p><div className="video-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="primary-button" onClick={() => item.id === "training" ? setScreen("video-learning") : startVideoProject(item.id)}>{item.id === "training" ? "开始学习" : "开始制作"}</button></div><button className="video-cover" onClick={() => item.id === "training" ? setScreen("video-learning") : startVideoProject(item.id)} aria-label={`${item.title}${item.id === "training" ? "课程库" : "视频制作"}`}><img src={item.image} alt={item.title} /><span>▶</span></button></section>)}</div>
        <div className="video-dashboard-grid">
          <section className="video-template-section"><div className="poster-section-heading"><h2>推荐视频模板</h2><div className="poster-filter-chips"><button className={videoFilter === "all" ? "active" : ""} onClick={() => setVideoFilter("all")}>全部</button><button className={videoFilter === "training" ? "active" : ""} onClick={() => setVideoFilter("training")}>内部培训</button><button className={videoFilter === "exhibition" ? "active" : ""} onClick={() => setVideoFilter("exhibition")}>展会讲解</button><button className={videoFilter === "social" ? "active" : ""} onClick={() => setVideoFilter("social")}>社交媒体</button><button className={videoFilter === "launch" ? "active" : ""} onClick={() => setVideoFilter("launch")}>产品上市</button></div><button className="text-button" onClick={() => notify("已展示全部企业视频模板")}>查看更多 →</button></div><div className="video-template-row">{filteredTemplates.map(([name, duration, type, src]) => <button key={name} onClick={() => type === "training" ? setScreen("video-learning") : startVideoProject(type as VideoCategory)}><div><img src={src} alt={name} /><span>▶</span><em>{duration}</em></div><strong>{name}</strong><small>{type === "training" ? "企业课程" : "企业模板"}</small></button>)}</div></section>
          <section className="video-recent-section"><div className="poster-section-heading"><h2>最近项目</h2><button className="text-button" onClick={() => notify("已展示全部视频项目")}>查看全部 →</button></div>{[
            ["PLD-11 产品讲解视频", "草稿", "/assets/products/pld-11/front.png"],
            ["朝露露点仪培训视频", "生成中 68%", "/assets/products/zhaolu/main.png"],
            ["哪吒局放测试仪新品发布", "待审核", "/assets/products/nezha/main.png"],
          ].map(([name, projectStatus, src], index) => <button key={name} onClick={() => index === 1 ? setScreen("video-learning") : startVideoProject(index === 2 ? "launch" : "exhibition")}><img src={src} alt={name} /><span><b>{name}</b><small>1080 × 1920 · 刚刚更新</small></span><em>{projectStatus}</em><i>继续编辑</i></button>)}</section>
        </div>
        <div className="video-editability">✓ 脚本可修改　　✓ 分镜可调整　　✓ 素材可替换　　✓ 时间轴可编辑　　✓ 配音字幕可编辑　　✓ 支持横竖版导出</div>
        <div className="video-assets-strip"><div><span>⌘</span><b>企业素材已连接</b></div><div><img src="/assets/posters/kgt-logo.png" alt="品牌 Logo" /><b>品牌 Logo</b></div><div><span className="brand-dots">●●●</span><b>标准色</b></div><div><span>▧</span><b>产品图库</b><small>3 个产品</small></div><div><span>▤</span><b>企业知识库</b></div><div><span>▣</span><b>历史视频</b><small>8 个素材</small></div></div>
      </div>
    );
  }

  function renderVideoLearning() {
    const selectedCourse = videoCourses.find((course) => course.id === selectedCourseId);
    return (
      <div className="video-learning-page">
        <div className="breadcrumb">宣传视频　/　内部人员学习</div>
        <div className="page-title-row"><div><h1>企业内部课程库</h1><p>集中管理已录制的产品教程，支持员工自主学习与进度记录</p></div><div className="page-actions"><button className="secondary-button" onClick={() => { setSelectedCourseId(null); setScreen("video-home"); }}>返回视频中心</button><button className="primary-button" onClick={() => notify("已打开课程录入窗口，可上传视频、文档和封面")}>＋ 录入课程</button></div></div>
        {selectedCourse ? <section className="course-player-panel"><div className="course-player"><img src={selectedCourse.src} alt={selectedCourse.title} /><button onClick={() => notify(`正在播放：${selectedCourse.title}`)}>▶</button></div><div className="course-outline"><span>{selectedCourse.level} · {selectedCourse.duration}</span><h2>{selectedCourse.title}</h2><p>{selectedCourse.product}</p><div className="course-progress"><i style={{ width: `${selectedCourse.progress}%` }} /></div><small>学习进度 {selectedCourse.progress}%</small><h3>课程目录</h3>{selectedCourse.chapters.map((chapter, index) => <button key={chapter} onClick={() => notify(`已切换到第 ${index + 1} 节：${chapter}`)}><span>{index + 1}</span>{chapter}<i>▶</i></button>)}</div></section> : <section className="learning-hero"><div><span>企业内部培训专区</span><h2>把产品教程沉淀为可持续复用的企业课程</h2><p>已录入 3 门课程 · 总时长 40 分钟 · 支持学习进度记录</p></div><div><b>3</b><span>课程</span><b>2</b><span>产品系列</span><b>67%</b><span>平均完成率</span></div></section>}
        <div className="course-toolbar"><div><button className="active">全部课程</button><button>产品操作</button><button>检测方法</button><button>维护保养</button></div><span>⌕　搜索课程或产品型号</span></div>
        <div className="course-grid">{videoCourses.map((course) => <article key={course.id}><button className="course-cover" onClick={() => setSelectedCourseId(course.id)}><img src={course.src} alt={course.title} /><span>▶</span><em>{course.duration}</em></button><div><span>{course.level}</span><h3>{course.title}</h3><p>{course.product}</p><div className="course-progress"><i style={{ width: `${course.progress}%` }} /></div><small>{course.progress === 100 ? "已完成" : course.progress ? `已学习 ${course.progress}%` : "尚未学习"}</small><button className="primary-button" onClick={() => setSelectedCourseId(course.id)}>{course.progress ? "继续学习" : "开始学习"}</button></div></article>)}</div>
      </div>
    );
  }

  function renderVideoCreate() {
    const steps = ["选择类型", "添加资料", "生成脚本与分镜", "生成视频素材", "编辑成片", "审核导出"];
    const categoryNames: Record<VideoCategory, string> = { training: "内部人员学习", exhibition: "展会讲解", social: "社交媒体内容", launch: "产品上市" };
    const stageContent = [
      ["确认视频类型", `当前选择：${categoryNames[videoCategory]}`, "可切换展会讲解、社交媒体内容或产品上市视频"],
      ["添加产品资料", "选择产品并上传说明书、图片或历史视频", "系统将基于企业知识库读取准确的产品信息"],
      ["生成脚本与分镜", "AI 已生成视频脚本、旁白和 6 个分镜建议", "所有文案与镜头描述均可人工修改"],
      ["生成视频素材", "根据分镜推荐产品图、场景图、配音和背景音乐", "可上传自有素材或替换系统推荐内容"],
      ["编辑成片", "在时间轴中调整镜头、字幕、配音和转场", "支持横版 16:9、竖版 9:16 与方形 1:1"],
      ["审核导出", "完成品牌规范检查并提交内部审核", "审核通过后导出 MP4 或多平台尺寸版本"],
    ][videoCreateStep - 1];
    return (
      <div className="video-create-page">
        <div className="breadcrumb">宣传视频　/　{categoryNames[videoCategory]}　/　新建视频</div>
        <div className="page-title-row"><div><h1>{categoryNames[videoCategory]}视频</h1><p>本地原型流程演示 · 生成内容需人工编辑与审核</p></div><button className="secondary-button" onClick={() => setScreen("video-home")}>返回视频中心</button></div>
        <div className="video-create-workspace"><aside>{steps.map((step, index) => <button key={step} className={videoCreateStep === index + 1 ? "active" : videoCreateStep > index + 1 ? "done" : ""} onClick={() => setVideoCreateStep(index + 1)}><span>{videoCreateStep > index + 1 ? "✓" : index + 1}</span><b>{step}</b><small>{videoCreateStep === index + 1 ? "当前步骤" : videoCreateStep > index + 1 ? "已完成" : "待处理"}</small></button>)}</aside><main><div className="video-stage-heading"><span>步骤 {videoCreateStep} / 6</span><h2>{stageContent[0]}</h2><p>{stageContent[1]}</p><small>{stageContent[2]}</small></div><div className={`video-stage-preview stage-${videoCreateStep}`}><div className="video-stage-icon">{["▦", "＋", "文", "▧", "▶", "✓"][videoCreateStep - 1]}</div>{videoCreateStep === 1 && <div className="video-type-options">{(["exhibition", "social", "launch"] as VideoCategory[]).map((type) => <button key={type} className={videoCategory === type ? "active" : ""} onClick={() => setVideoCategory(type)}>{categoryNames[type]}</button>)}</div>}{videoCreateStep === 2 && <button className="upload-zone" onClick={() => notify("演示模式：资料上传入口已打开")}>＋ 点击添加产品资料或拖拽文件到这里</button>}{videoCreateStep === 3 && <div className="script-preview"><b>镜头 01　产品亮相</b><p>旁白：让每一次现场检测更准确、更高效……</p><b>镜头 02　核心功能</b><p>画面展示产品操作与关键检测结果，文案可直接编辑。</p></div>}{videoCreateStep === 4 && <div className="material-preview">{[product.images[0], "/assets/products/nezha/main.png", "/assets/products/zhaolu/main.png"].map((src, index) => <img key={src} src={src} alt={`推荐素材${index + 1}`} />)}</div>}{videoCreateStep === 5 && <div className="timeline-preview"><div>视频预览　▶</div><p><span style={{ width: "24%" }} /><span style={{ width: "34%" }} /><span style={{ width: "28%" }} /></p><small>视频轨道　　字幕轨道　　配音轨道　　背景音乐</small></div>}{videoCreateStep === 6 && <div className="review-preview"><b>✓ 品牌 Logo 使用规范</b><b>✓ 产品名称与型号已核对</b><b>✓ 字幕安全区正常</b><b>✓ 音乐版权来源已记录</b></div>}</div><div className="video-stage-actions"><button className="secondary-button" disabled={videoCreateStep === 1} onClick={() => setVideoCreateStep((step) => Math.max(1, step - 1))}>上一步</button><button className="primary-button" onClick={() => videoCreateStep < 6 ? setVideoCreateStep((step) => Math.min(6, step + 1)) : notify("视频项目已提交审核")}>{videoCreateStep < 6 ? "保存并继续" : "提交审核"}</button></div></main></div>
      </div>
    );
  }

  function renderKnowledgeCenter() {
    const normalizedQuery = knowledgeQuery.trim().toLowerCase();
    const filteredBrandItems = brandKnowledgeItems.filter((item) => !normalizedQuery || `${item.title}${item.description}`.toLowerCase().includes(normalizedQuery));
    const filteredProductItems = productKnowledgeItems.filter((item) => !normalizedQuery || `${item.model}${item.name}`.toLowerCase().includes(normalizedQuery));

    if (knowledgeView === "brand") {
      return (
        <div className="knowledge-page knowledge-manage-page">
          <div className="knowledge-title-row"><div><button className="knowledge-back" onClick={() => setKnowledgeView("overview")}>← 返回知识管理中心</button><h1>公司品牌库</h1><p>统一维护企业品牌规范与标准资产，为所有营销内容提供一致的品牌依据</p></div><div><span className="role-badge">♙ 当前角色：AI 产品经理</span><button className="primary-button" onClick={addBrandKnowledge}>＋ 新增品牌内容</button></div></div>
          <div className="knowledge-manage-toolbar"><label>⌕<input value={knowledgeQuery} onChange={(event) => setKnowledgeQuery(event.target.value)} placeholder="搜索品牌介绍、Logo 规范、标准色或品牌话术" /></label><span>可新增、编辑、停用和删除内容</span></div>
          <div className="brand-manage-grid">{filteredBrandItems.map((item) => <article key={item.id} className={item.status === "已停用" ? "disabled" : ""}><div className="brand-item-icon">{item.icon}</div><div><h3>{item.title}</h3><p>{item.description}</p><span className={`knowledge-status ${item.status === "已启用" ? "enabled" : "disabled"}`}>{item.status}</span></div><footer><button onClick={() => editBrandKnowledge(item)}>编辑</button><button onClick={() => toggleBrandKnowledge(item)}>{item.status === "已启用" ? "停用" : "恢复"}</button><button className="danger-text" onClick={() => deleteBrandKnowledge(item)}>删除</button></footer></article>)}</div>
          {!filteredBrandItems.length && <div className="knowledge-empty">没有找到匹配的品牌内容</div>}
          <div className="knowledge-governance-note"><b>品牌内容使用规则</b><p>停用内容不会再被产品问答、彩页生成和视频脚本调用；删除前建议先确认没有项目正在引用。</p></div>
        </div>
      );
    }

    if (knowledgeView === "products") {
      return (
        <div className="knowledge-page knowledge-manage-page">
          <div className="knowledge-title-row"><div><button className="knowledge-back" onClick={() => setKnowledgeView("overview")}>← 返回知识管理中心</button><h1>公司产品库</h1><p>按产品统一维护说明书、原始资料、产品图片和历史资料</p></div><div><span className="role-badge">♙ 当前角色：AI 产品经理</span><button className="primary-button" onClick={addProductKnowledge}>＋ 新建产品</button></div></div>
          <div className="knowledge-manage-toolbar"><label>⌕<input value={knowledgeQuery} onChange={(event) => setKnowledgeQuery(event.target.value)} placeholder="搜索产品名称或型号" /></label><span>支持新建产品、更新资料和归档旧版本</span></div>
          <div className="product-manage-list">{filteredProductItems.map((item) => <article key={item.id} className={item.status === "已停用" ? "disabled" : ""}><img src={item.image} alt={item.name} /><div><span className="product-model">{item.model}</span><h3>{item.name}</h3><p>产品说明书　·　原始资料　·　产品图片　·　历史资料</p><small>{item.sourceCount ? `已接入 ${item.sourceCount} 份来源资料` : "尚未添加来源资料"}</small></div><span className={`knowledge-status ${item.status === "已启用" ? "enabled" : "disabled"}`}>{item.status}</span><footer><button onClick={() => notify(`已打开 ${item.model} 产品资料管理页`)}>管理资料</button><button onClick={() => notify(`已打开 ${item.model} 基础信息编辑页`)}>编辑信息</button><button onClick={() => toggleProductKnowledge(item)}>{item.status === "已启用" ? "归档" : "恢复"}</button><button className="danger-text" onClick={() => deleteProductKnowledge(item)}>删除</button></footer></article>)}</div>
          {!filteredProductItems.length && <div className="knowledge-empty">没有找到匹配的产品档案</div>}
        </div>
      );
    }

    return (
      <div className="knowledge-page">
        <div className="knowledge-title-row"><div><h1>企业知识管理中心</h1><p>沉淀公司品牌与产品知识，统一维护内容并为 AI 生成提供可信依据</p></div><span className="role-badge">♙ 当前角色：AI 产品经理</span></div>
        <div className="knowledge-search-row"><label>⌕<input value={knowledgeQuery} onChange={(event) => setKnowledgeQuery(event.target.value)} placeholder="搜索品牌规范、产品名称、型号、说明书、彩页或视频" /></label><button className="primary-button" onClick={addBrandKnowledge}>＋ 新增品牌内容</button><button className="secondary-button" onClick={addProductKnowledge}>＋ 新建产品</button></div>
        <div className="knowledge-core-grid">
          <section className="knowledge-core-card brand-core"><div className="knowledge-card-heading"><span className="knowledge-card-icon">▰</span><div><h2>公司品牌库</h2><p>统一维护企业品牌规范与标准资产</p></div></div><div className="brand-category-grid">{brandKnowledgeItems.slice(0, 6).map((item) => <button key={item.id} onClick={() => setKnowledgeView("brand")}><span>{item.icon}</span><b>{item.title}</b></button>)}</div><div className="knowledge-card-note">ⓘ 可新增、编辑、停用和删除内容</div><footer><button className="knowledge-primary-action" onClick={() => setKnowledgeView("brand")}>进入品牌库　→</button><button onClick={() => setKnowledgeView("brand")}>⚙ 管理内容</button></footer></section>
          <section className="knowledge-core-card product-core"><div className="knowledge-card-heading"><span className="knowledge-card-icon">▰</span><div><h2>公司产品库</h2><p>按产品统一管理来源资料与权威信息</p></div></div><div className="knowledge-chips"><span>产品说明书</span><span>原始资料</span><span>产品图片</span><span>历史资料</span></div><div className="knowledge-product-summary">{productKnowledgeItems.slice(0, 3).map((item) => <button key={item.id} onClick={() => setKnowledgeView("products")}><span>•</span><b>{item.model}</b>{item.name}</button>)}</div><div className="knowledge-card-note">ⓘ 支持新建产品、更新资料、归档旧版本</div><footer><button className="knowledge-primary-action" onClick={() => setKnowledgeView("products")}>进入产品库　→</button><button onClick={addProductKnowledge}>＋ 新建产品</button></footer></section>
        </div>
        <div className="knowledge-section-heading"><h2>营销内容索引</h2><p>内容统一检索，正式文件仍存放在素材库和视频中心，避免重复保存</p></div>
        <div className="knowledge-index-grid">
          <section><span className="index-illustration print">▤</span><div><h2>平面物料索引</h2><div className="knowledge-chips"><span>产品宣传彩页</span><span>产品海报</span><span>节气海报</span><span>产品说明书</span><span>展会物料</span></div><button onClick={() => setScreen("assets")}>查看平面物料　→</button></div><small>来源：素材库</small></section>
          <section><span className="index-illustration video">▶</span><div><h2>宣传视频索引</h2><div className="knowledge-chips orange"><span>内部培训视频</span><span>产品操作教程</span><span>产品讲解</span><span>展会讲解</span><span>产品上市</span></div><button onClick={() => setScreen("video-home")}>查看宣传视频　→</button></div><small>来源：视频中心</small></section>
        </div>
        <div className="knowledge-bottom-grid">
          <section className="knowledge-recent"><h3>◷ 最近维护</h3><button onClick={() => setKnowledgeView("products")}><span>▤</span><b>PLD-11 产品档案</b><em>已更新</em><i>›</i></button><button onClick={() => setKnowledgeView("brand")}><span>▤</span><b>公司品牌 Logo 规范</b><em>已更新</em><i>›</i></button><button onClick={() => setScreen("video-learning")}><span>▶</span><b>内部产品培训视频</b><em className="pending">待完善</em><i>›</i></button></section>
          <section className="knowledge-usage"><div><h3>⌘ 知识如何被使用</h3><p>下游应用只调用审核通过且已启用的知识</p></div><div className="usage-flow"><span><b>品牌库</b><small>品牌规范</small></span><strong>＋</strong><span><b>产品库</b><small>权威资料</small></span><strong>→</strong><button onClick={() => setScreen("qa")}><b>产品问答</b><small>智能解答</small></button><strong>→</strong><button onClick={() => setScreen("select")}><b>彩页生成</b><small>营销内容</small></button><strong>→</strong><button onClick={() => setScreen("video-create")}><b>视频脚本</b><small>脚本与分镜</small></button></div></section>
        </div>
      </div>
    );
  }

  function renderAssetLibrary() {
    const categories: Array<["all" | LibraryCategory, string, string]> = [
      ["all", "全部素材", "▦"],
      ["leaflet", "产品宣传彩页", "▤"],
      ["product-poster", "产品海报", "▧"],
      ["solar-poster", "节气与节日海报", "叶"],
      ["product-image", "产品图片", "◉"],
      ["brand", "品牌素材", "K"],
      ["video", "宣传视频", "▶"],
    ];
    const categoryCount = (category: "all" | LibraryCategory) => category === "all" ? libraryAssets.length : libraryAssets.filter((item) => item.category === category).length;
    return (
      <div className="asset-library-page">
        <div className="asset-library-title"><div><h1>企业素材库</h1><p>集中整理你已提供的彩页、海报、产品图片与品牌素材</p></div><button className="primary-button" onClick={() => notify("可导入企业现有素材，导入后需补充分类和来源")}>＋ 导入已有素材</button></div>
        <div className="asset-archive-banner">✓ 业务负责人确认后，系统将自动归档正式版本；当前页面仅展示已经提供或项目中真实存在的素材。</div>
        <div className="asset-library-toolbar"><label>⌕<input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="搜索产品、型号、物料名称或标签" /></label><span>共 {libraryAssets.length} 组素材</span></div>
        <div className="asset-library-layout">
          <aside className="asset-category-panel"><h3>素材分类</h3>{categories.map(([key, label, icon]) => <button key={key} className={libraryFilter === key ? "active" : ""} onClick={() => setLibraryFilter(key)}><span>{icon}</span><b>{label}</b><em>{categoryCount(key)}</em></button>)}<div><b>素材说明</b><p>本页不生成虚构素材。没有真实文件的“宣传视频”暂显示为 0。</p></div></aside>
          <main className="asset-library-main">
            <div className="asset-filter-tabs">{categories.slice(0, 6).map(([key, label]) => <button key={key} className={libraryFilter === key ? "active" : ""} onClick={() => setLibraryFilter(key)}>{label}</button>)}</div>
            {filteredLibraryAssets.length ? <div className="asset-real-grid">{filteredLibraryAssets.map((item) => <article key={item.id} className={selectedLibraryAssetId === item.id ? "selected" : ""} onClick={() => setSelectedLibraryAssetId(item.id)}>
              <div className={`asset-card-preview category-${item.category}`}><div>{item.files.slice(0, 3).map((src, index) => <img key={src} src={src} alt={`${item.name}${index + 1}`} />)}</div><span>{item.categoryLabel}</span><em>{item.files.length} 个文件</em></div>
              <h3>{item.name}</h3><div className="asset-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><p>{item.source}</p><footer><button onClick={(event) => { event.stopPropagation(); setSelectedLibraryAssetId(item.id); setLibraryPreviewOpen(true); }}>◉ 预览</button><button onClick={(event) => { event.stopPropagation(); downloadLibraryFile(item.files[0], item.name, 0); }}>⇩ 下载</button><button onClick={(event) => { event.stopPropagation(); notify(`${item.name}共有 ${item.files.length} 个真实文件`); }}>•••</button></footer>
            </article>)}</div> : <div className="asset-empty"><span>▶</span><h2>暂无已归档视频</h2><p>当前项目中还没有用户提供的 MP4 视频文件，因此不展示模拟视频。</p></div>}
          </main>
          <aside className="asset-detail-panel"><div className="panel-heading"><h3>素材详情</h3><span>真实资料</span></div><div className="asset-detail-preview">{selectedLibraryAsset.files.slice(0, 2).map((src) => <img key={src} src={src} alt={selectedLibraryAsset.name} />)}</div><h2>{selectedLibraryAsset.name}</h2><dl><div><dt>物料类型</dt><dd>{selectedLibraryAsset.categoryLabel}</dd></div><div><dt>资料来源</dt><dd>{selectedLibraryAsset.source}</dd></div><div><dt>文件数量</dt><dd>{selectedLibraryAsset.files.length} 个</dd></div><div><dt>标签</dt><dd>{selectedLibraryAsset.tags.join("、")}</dd></div></dl><div className="asset-file-list"><h4>包含文件</h4>{selectedLibraryAsset.files.map((src, index) => <button key={src} onClick={() => downloadLibraryFile(src, selectedLibraryAsset.name, index)}><span>{src.split("/").pop()}</span><b>下载</b></button>)}</div><button className="secondary-button wide" onClick={() => setLibraryPreviewOpen(true)}>查看大图</button><div className="asset-permission-note"><b>下载规则</b><p>正式版本上线后，普通使用人员只下载审核通过的最新版本；设计师和管理员可查看历史版本与源文件。</p></div></aside>
        </div>
        {libraryPreviewOpen && <div className="asset-library-modal" role="dialog" aria-modal="true"><header><div><b>{selectedLibraryAsset.name}</b><span>{selectedLibraryAsset.source}</span></div><button onClick={() => setLibraryPreviewOpen(false)}>×</button></header><main>{selectedLibraryAsset.files.map((src, index) => <figure key={src}><img src={src} alt={`${selectedLibraryAsset.name}${index + 1}`} /><figcaption>文件 {index + 1}</figcaption></figure>)}</main><footer><button className="secondary-button" onClick={() => setLibraryPreviewOpen(false)}>关闭</button>{selectedLibraryAsset.files.map((src, index) => <button className="primary-button" key={src} onClick={() => downloadLibraryFile(src, selectedLibraryAsset.name, index)}>下载{selectedLibraryAsset.files.length > 1 ? `文件 ${index + 1}` : "素材"}</button>)}</footer></div>}
      </div>
    );
  }

  function renderTeamWorkspace() {
    const workflow = ["文案已确认", "设计制作中", "AI规则预审", "业务负责人确认", "自动归档素材库"];
    const currentStep = designWorkflowStatus === "设计制作中" ? 1 : designWorkflowStatus === "AI审核中" ? 2 : designWorkflowStatus === "待业务确认" ? 3 : 4;
    const otherTasks = [
      ["新品上市海报视觉设计", "海报", "设计中", "08月10日", "王琳（业务负责人）"],
      ["60秒新品视频封面与字幕设计支持", "视频封面", "设计中", "08月07日", "周然（视频运营）"],
      ["产品手册 V2 内页版式优化", "彩页", "待修改", "08月09日", "王琳（业务负责人）"],
      ["展会易拉宝设计支持", "展会物料", "待开始", "08月15日", "赵磊（产品总监）"],
    ];
    return (
      <div className="team-workbench-page">
        <div className="team-title-row"><div><h1>我的设计工作台 <span>平面设计师</span></h1><p>接收已确认文案，完成设计并提交下一位审核人</p></div><button className="secondary-button" onClick={resetWorkflowDemo}>重置演示流程</button></div>
        <div className="team-stat-grid">{[["待开始", "2", "▤"], ["设计中", "3", "✎"], ["待修改", "1", "●"], ["本周已完成", "4", "✓"]].map(([label, count, icon]) => <section key={label}><div><small>{label}</small><b>{count}</b></div><span>{icon}</span></section>)}</div>
        <div className="team-workbench-grid">
          <main>
            <section className="design-task-card">
              <div className="design-task-heading"><div><h2>PLD-11 智能数字听漏仪双页彩页 <em>V2</em></h2><span>受理时间：08月02日 14:30</span></div><i className={`design-status status-${designWorkflowStatus}`}>{designWorkflowStatus}</i></div>
              <div className="design-workflow">{workflow.map((step, index) => <div key={step} className={index < currentStep ? "done" : index === currentStep ? "active" : ""}><span>{index < currentStep ? "✓" : index + 1}</span><b>{step}</b>{index < workflow.length - 1 && <i>→</i>}</div>)}</div>
              <div className="design-content-grid">
                <section className="approved-copy-panel"><div className="panel-heading"><h3>已确认文案</h3><span>文案已确认</span></div>{[["产品介绍", productSeed.summary], ["核心卖点", productSeed.features.slice(0, 2).join("；")], ["检测对象", productSeed.targets], ["技术参数", "频率范围 0–6000Hz · 防护等级 IP54 · 蓝牙/WAPI/USB"]].map(([title, content]) => <article key={title}><div><b>{title}</b><small>{content}</small></div><span>▣</span></article>)}<button onClick={() => notify("已打开 PLD-11 完整确认文案")}>查看完整文案</button></section>
                <section className="design-file-panel"><div className="panel-heading"><h3>设计文件</h3><span>当前版本：V2</span></div><div className="leaflet-file-preview"><div><img src="/assets/templates/leaflet/preview-page-1.png" alt="PLD-11 双页彩页第一页" /><img src="/assets/templates/leaflet/preview-page-2.png" alt="PLD-11 双页彩页第二页" /></div><aside><b>PLD-11_leaflet_V2.pdf</b><span>▣ 评论　3</span><span>最后更新：08月08日 16:20</span><span>更新人：李静</span><em>使用已导入的 PLD-11 彩页资料</em></aside></div><div className="design-file-actions"><button onClick={() => notify("新版本上传入口已打开")}>↥ 上传新版本</button><button className="primary-button" onClick={() => setScreen("edit")}>✎ 在线编辑</button></div></section>
              </div>
              <div className="design-submit-row"><button className="secondary-button" onClick={() => { persist(); notify("设计草稿已保存到本机"); }}>保存草稿</button><button className="primary-button" disabled={designWorkflowStatus === "AI审核中"} onClick={() => designWorkflowStatus === "设计制作中" ? submitDesignForAiReview() : designWorkflowStatus === "待业务确认" ? confirmBusinessAndArchive() : setScreen("assets")}>{designWorkflowStatus === "设计制作中" ? "提交并开始AI预审" : designWorkflowStatus === "AI审核中" ? "AI预审进行中…" : designWorkflowStatus === "待业务确认" ? "业务确认并自动归档" : "已归档 · 查看素材"}</button><div><span>{designWorkflowStatus === "待业务确认" ? "当前确认人：" : designWorkflowStatus === "已归档" ? "归档位置：" : "预审通过后流转给："}</span><b>{designWorkflowStatus === "已归档" ? "企业素材库" : "王琳（业务负责人）"}</b></div></div>
              <div className="ai-flow-note">ⓘ 演示说明：AI预审使用规则模拟；业务负责人确认后，正式版本会自动进入素材库。</div>
            </section>
            <section className="designer-task-list"><div className="panel-heading"><h3>我的其他任务</h3><div><button className="active">全部 6</button><button>设计中 3</button><button>待开始 2</button><button>待修改 1</button></div></div><div className="designer-task-head"><span>项目名称</span><span>物料类型</span><span>当前流程</span><span>状态</span><span>截止日期</span><span>下一位处理人</span></div>{otherTasks.map(([name, type, taskStatus, due, next]) => <button key={name}><b>{name}</b><em>{type}</em><span>设计制作 → AI审核 → 业务确认 → 自动归档</span><i>{taskStatus}</i><strong>{due}</strong><small>{next}　›</small></button>)}</section>
          </main>
          <aside className="team-side-column">
            <section><div className="panel-heading"><h3>审核与修改意见</h3><button>查看所有意见（3）›</button></div><article className="review-comment"><div><span>赵磊</span><b>产品总监</b><i>待处理</i></div><p>第1页核心卖点图标与文案对齐有偏差；第2页参数表格线颜色建议与主色保持一致。</p><small>涉及页面：第1页、第2页　·　08-08 15:30</small><button onClick={() => notify("已打开评论回复框")}>回复</button></article><article className="review-comment resolved"><div><span>王琳</span><b>产品经理</b><i>已解决</i></div><p>整体排版和信息层级清晰，可以进入下一轮审核。</p><small>涉及页面：全部页面　·　08-07 11:20</small></article></section>
            <section className="ai-review-card"><div className="panel-heading"><h3>AI 审核规则</h3><span>提交后自动检查</span></div>{["型号与参数一致性", "错别字与敏感表述", "Logo / 二维码规范", "安全边距与图片清晰度"].map((rule) => <p key={rule}>✓ {rule}</p>)}</section>
            <section className="version-card"><div className="panel-heading"><h3>版本历史</h3><button>查看全部版本 ›</button></div><p><b>V2</b><span>当前版本 · 李静 · 08-08 16:20</span><em>评论 3</em></p><p><b>V1</b><span>文案版本 · 李静 · 08-07 10:45</span><em>评论 1</em></p></section>
            <section className="designer-rule-card"><h3>⚠ 重要规则</h3><b>设计师不可审核自己的作品</b><p>普通物料经 AI 审核与业务负责人确认后自动归档。新品发布、重大展会等重点项目可单独开启总监终审。</p></section>
          </aside>
        </div>
      </div>
    );
  }

  function renderQa() {
    const prompts = [
      ["▣", "今天想问什么产品", "介绍一下 PLD-11 是什么产品"],
      ["⚖", "与其他型号有什么区别", `${qaProduct.model} 与其他型号有什么区别`],
      ["♛", "自研产品竞争力", `${qaProduct.model} 有哪些核心卖点和竞争力`],
      ["⌖", "可以检测哪些对象", `${qaProduct.model} 可以检测哪些对象`],
    ];
    return (
      <div className="qa-page">
        <div className="qa-topline"><div><h1>产品问答</h1><p>基于三个演示产品的说明书、参数表和历史彩页，快速查询产品信息</p></div><span>✓ 三个演示产品资料已加载</span></div>
        <div className="qa-product-tabs" aria-label="选择问答产品">
          {productCatalog.map((item) => <button key={item.id} className={qaProductId === item.id ? "active" : ""} onClick={() => setQaProductId(item.id)}><img src={item.images[0]} alt="" /><span><small>{item.model}</small><b>{item.displayName}</b></span></button>)}
        </div>
        <div className="qa-layout">
          <aside className="qa-guide-card">
            <div className="kiti-card"><img src="/assets/brand/kiti.jpg" alt="Kiti 产品问答助手" /><span>在线</span></div>
            <h2>你好，我是 Kiti</h2><p>我可以根据康高特现有产品资料，帮你查询产品功能、参数、适用对象和型号区别。</p>
            <div className="qa-guide-meta"><span>已接入资料</span><b>{qaProduct.sources.length} 份</b><span>当前产品</span><b>{qaProduct.model}</b></div>
          </aside>
          <main className="qa-chat-card">
            <div className="qa-chat-header"><div><img src="/assets/brand/kiti.jpg" alt="" /><span><b>Kiti 产品助手</b><small>本地资料匹配模式 · 不调用外部大模型</small></span></div><button onClick={() => setQaMessages([{ id: `welcome-${Date.now()}`, role: "assistant", content: "你好，我是 Kiti。今天想问什么产品？你可以直接告诉我产品名称或型号。" }])}>清空对话</button></div>
            <div className="qa-messages">
              {qaMessages.map((message) => <div key={message.id} className={`qa-message ${message.role}`}>
                {message.role === "assistant" && <img src="/assets/brand/kiti.jpg" alt="Kiti" />}
                <div><p>{message.content}</p>{message.sources && <div className="qa-sources">{message.sources.map((source, index) => <span key={`${source}-${index}`}>▤ {source}</span>)}{message.confidence && <em>答案置信度　{message.confidence}%</em>}</div>}</div>
              </div>)}
            </div>
            <div className="qa-prompt-grid">{prompts.map(([icon, label, question]) => <button key={label} onClick={() => sendQaMessage(question)}><span>{icon}</span>{label}<i>›</i></button>)}</div>
            <div className={`qa-composer ${qaListening ? "listening" : ""}`}><textarea value={qaInput} onChange={(event) => setQaInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendQaMessage(); } }} placeholder={qaListening ? "正在聆听，请说出你的问题……" : "输入产品问题，或点击麦克风语音提问"} /><button className="qa-mic" onClick={startQaVoiceInput} title="语音输入">{qaListening ? "■" : "◉"}</button><button className="qa-send" onClick={() => sendQaMessage()}>➤</button><small>Enter 发送 · Shift + Enter 换行 · 回答内容需结合正式资料复核</small></div>
          </main>
        </div>
      </div>
    );
  }

  function renderPosterHome() {
    const featuredSolar = posterTemplates.filter((item) => item.type === "solar").slice(0, 4);
    const featuredProduct = posterTemplates.find((item) => item.id === "product-houyi") ?? posterTemplates[4];
    return (
      <div className="poster-home-page">
        <div className="breadcrumb">平面物料　/　海报</div>
        <div className="page-title-row"><div><h1>海报创作中心</h1><p>基于企业品牌模板和产品资料，快速生成可编辑、可审核的营销海报</p></div><button className="primary-button" onClick={() => startPoster("solar")}>＋ 新建海报</button></div>
        <div className="poster-entry-grid">
          <section className="poster-entry-card"><div><h2>24节气海报</h2><p>结合节气文化与企业品牌，生成节气宣传海报</p><div className="poster-tags"><span>春夏秋冬</span><span>品牌传播</span></div><button className="primary-button" onClick={() => startPoster("solar")}>开始制作</button></div><div className="solar-collage">{featuredSolar.map((item) => <img key={item.id} src={item.src} alt={item.name} />)}</div></section>
          <section className="poster-entry-card"><div><h2>产品海报</h2><p>基于产品资料，生成新品、卖点与场景宣传海报</p><div className="poster-tags"><span>新品发布</span><span>核心卖点</span><span>应用场景</span></div><button className="primary-button" onClick={() => startPoster("product")}>开始制作</button></div><img className="product-poster-feature" src={featuredProduct.src} alt={featuredProduct.name} /></section>
        </div>
        <div className="poster-dashboard-grid">
          <section className="poster-recommend-section"><div className="poster-section-heading"><h2>推荐模板</h2><div className="poster-filter-chips"><button className={posterFilter === "all" ? "active" : ""} onClick={() => setPosterFilter("all")}>全部</button><button className={posterFilter === "solar" ? "active" : ""} onClick={() => setPosterFilter("solar")}>24节气</button><button className={posterFilter === "product" ? "active" : ""} onClick={() => setPosterFilter("product")}>产品海报</button></div><button className="text-button" onClick={() => setScreen("poster-templates")}>查看更多 →</button></div><div className="poster-template-row">{filteredPosterTemplates.slice(0, 4).map((item) => <button key={item.id} onClick={() => usePosterTemplate(item)}><div><img src={item.src} alt={item.name} /><em>{item.source}</em></div><strong>{item.name}</strong><span>{item.type === "solar" ? "24节气" : "产品海报"}</span></button>)}</div></section>
          <section className="poster-recent-section"><div className="poster-section-heading"><h2>最近项目</h2><button className="text-button">查看全部 →</button></div>{[
            ["谷雨节气海报", "草稿", "/assets/posters/solar-qingming.jpg"],
            ["PLD-11 新品上市海报", "待审核", "/assets/posters/product-houyi.jpg"],
            ["清明文明祭祀海报", "已完成", "/assets/posters/solar-qingming.jpg"],
          ].map(([name, projectStatus, src]) => <button key={`${name}-${projectStatus}`} onClick={() => setScreen("poster-editor")}><img src={src} alt={name} /><span><b>{name}</b><small>1080 × 1920 · 刚刚更新</small></span><em className={`poster-status poster-status-${projectStatus}`}>{projectStatus}</em><i>继续编辑</i></button>)}</section>
        </div>
        <div className="poster-assets-strip"><div><span>⌘</span><b>企业素材已连接</b><small>已接入品牌与产品资料，智能推荐更贴合品牌的海报内容</small></div><div><img src="/assets/posters/kgt-logo.png" alt="KGT Logo" /><b>品牌 Logo</b></div><div><span className="brand-dots">●●●</span><b>标准色</b></div><div><span>▧</span><b>产品图库</b><small>3 个产品</small></div><div><span>▤</span><b>历史海报</b><small>{posterTemplates.length} 个素材</small></div></div>
      </div>
    );
  }

  function renderPosterTemplates() {
    return (
      <div className="content-page poster-template-page">
        <div className="breadcrumb">平面物料　/　海报　/　选择模板</div>
        <div className="page-title-row"><div><h1>选择海报模板</h1><p>企业历史作品与外部推荐模板统一展示，选中后进入可视化编辑器</p></div><button className="secondary-button" onClick={() => setScreen("poster-home")}>返回海报中心</button></div>
        <div className="poster-template-toolbar"><div className="poster-filter-chips"><button className={posterFilter === "all" ? "active" : ""} onClick={() => setPosterFilter("all")}>全部模板</button><button className={posterFilter === "solar" ? "active" : ""} onClick={() => setPosterFilter("solar")}>24节气</button><button className={posterFilter === "product" ? "active" : ""} onClick={() => setPosterFilter("product")}>产品海报</button></div><span>来源：企业内部　历史作品　稿定推荐（演示）</span></div>
        <div className="poster-template-gallery">{filteredPosterTemplates.map((item) => <article key={item.id}><div className="poster-template-image"><img src={item.src} alt={item.name} /><em>{item.source}</em><button onClick={() => usePosterTemplate(item)}>使用此模板</button></div><h3>{item.name}</h3><p>{item.tags.join("　·　")}</p></article>)}</div>
        <div className="gaoding-demo-note"><b>稿定推荐（演示）</b><span>当前使用本地模拟模板和统一适配接口；正式版购买稿定开放平台权益后可替换为真实模板中心 SDK。</span></div>
      </div>
    );
  }

  function renderPosterEditor() {
    const posterLayers = ["标题文字", "节气文案", "产品主图", "场景图片", "品牌Logo", "二维码", "背景", "装饰元素"];
    return (
      <div className="poster-editor-page">
        <div className="poster-editor-top"><div><div className="breadcrumb">平面物料　/　海报　/　{posterType === "solar" ? "24节气海报" : "产品海报"}　/　编辑</div><h1>{selectedPoster.name}</h1></div><div className="poster-steps"><span>✓ 选择类型</span><i /><span>✓ 选择模板</span><i /><b>3 编辑调整</b><i /><span>4 预览导出</span></div><div className="editor-actions"><button onClick={() => notify("已生成一版新的海报排版建议")}>✦ AI重新生成</button><button onClick={() => setPosterPreviewOpen(true)}>◉ 预览</button><button onClick={() => notify("海报草稿已保存到本机")}>▣ 保存草稿</button><button className="primary-button" onClick={() => notify("海报已提交审核")}>提交审核</button></div></div>
        <div className="poster-editor-workspace">
          <aside className="poster-layers-panel"><h3>页面与图层</h3><div className="poster-page-thumb"><img src={posterCanvasSrc} alt="海报页面" /><span>1</span></div><div className="panel-tabs"><button className="active">图层</button><button>素材</button></div><div className="poster-layer-list">{posterLayers.map((layer) => <button key={layer} className={posterLayer === layer ? "active" : ""} onClick={() => setPosterLayer(layer)}><span>⠿</span>{layer}<i>◉</i>{["品牌Logo", "二维码"].includes(layer) && <em>🔒</em>}</button>)}</div><div className="layer-add-actions"><button onClick={() => { setPosterLayer("标题文字"); notify("已添加新的文字图层"); }}>＋ 添加文字</button><button onClick={() => posterFileInputRef.current?.click()}>＋ 添加图片</button></div><p className="poster-lock-note">🔒 品牌 Logo 与二维码默认锁定，管理员授权后可解锁。</p></aside>
          <main className="poster-canvas-area"><div className="poster-canvas-toolbar"><span>⌕ {posterZoom}%⌄</span><button onClick={() => notify("已撤销上一步")}>↶ 撤销</button><button onClick={() => notify("已重做")}>↷ 重做</button><button>☷ 对齐⌄</button><button>⌗ 参考线</button><button onClick={() => setPosterZoom(75)}>□ 适应画布</button></div><div className="poster-stage"><div className="poster-artboard" style={{ transform: `scale(${posterZoom / 75})` }}><img src={posterCanvasSrc} alt={selectedPoster.name} /><div className={`poster-title-overlay ${posterLayer === "标题文字" ? "selected" : ""}`} style={{ color: posterTitleColor, fontSize: `${posterTitleSize / 8}px`, transform: `translate(${posterTitleX / 5}px, ${posterTitleY / 5}px)` }} onPointerDown={beginPosterTitleDrag} onPointerMove={movePosterTitle} onPointerUp={endPosterTitleDrag} onPointerCancel={endPosterTitleDrag}><strong>{posterTitle}</strong><span>{posterSubtitle}</span></div></div></div><div className="assistant-bar"><input placeholder="输入修改要求，例如：标题放大、产品图向下移动、背景换成春雨场景…" /><button>添加资料</button><button>推荐素材</button><button className="send-button" onClick={() => notify("已执行海报修改要求")}>➤</button></div></main>
          <aside className="poster-properties-panel"><h3>{posterLayer === "标题文字" ? "文字设置" : posterLayer === "背景" ? "背景设置" : "图层设置"}</h3>{posterLayer === "标题文字" ? <><label>文本内容<textarea rows={3} value={posterTitle} onChange={(event) => setPosterTitle(event.target.value)} /></label><label>副标题<textarea rows={3} value={posterSubtitle} onChange={(event) => setPosterSubtitle(event.target.value)} /></label><div className="property-row"><label>字体<select><option>阿里巴巴普惠体</option><option>思源黑体 CN</option><option>方正宋体</option></select></label><label>字号<input type="number" min="20" max="160" value={posterTitleSize} onChange={(event) => setPosterTitleSize(Number(event.target.value))} /></label></div><div className="format-buttons"><button className="active">B</button><button>I</button><button>U</button><button>左</button><button>中</button><button>右</button></div><label>文字颜色<input type="color" value={posterTitleColor} onChange={(event) => setPosterTitleColor(event.target.value)} /></label><label>水平位置<input type="range" min="-180" max="180" value={posterTitleX} onChange={(event) => setPosterTitleX(Number(event.target.value))} /></label><label>垂直位置<input type="range" min="-260" max="360" value={posterTitleY} onChange={(event) => setPosterTitleY(Number(event.target.value))} /></label><label>透明度<input type="range" min="10" max="100" defaultValue="100" /></label><div className="poster-property-actions"><button>复制图层</button><button className="danger-button">删除图层</button></div></> : <><img className="poster-property-preview" src={posterCanvasSrc} alt="当前图层" /><button className="secondary-button wide" onClick={() => posterFileInputRef.current?.click()}>上传并替换图片</button><label>透明度<input type="range" min="10" max="100" defaultValue="100" /></label><label>缩放<input type="range" min="50" max="160" defaultValue="100" /></label></>}<div className="brand-check-card"><h4>品牌规范检查　›</h4><p>✓ Logo 安全区正常</p><p>✓ 标准色使用正常</p></div></aside>
        </div>
      </div>
    );
  }

  function renderSelect() {
    return (
      <div className="flow-page">
        {pageHeader(1)}
        <section className="flow-section">
          <h2>选择产品</h2><p className="muted">从企业产品知识库中选择需要制作彩页的产品</p>
          <div className="knowledge-search"><label>⌕<input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="输入产品名称或型号，例如：PLD-11、大海" /></label><button onClick={() => notify(`检索到 ${filteredProducts.length} 个产品`)}>从演示资料检索</button><em>✓ 本地演示产品资料已加载</em></div>
          <div className="result-heading"><h3>检索结果</h3><span>当前已接入 {productCatalog.length} 个产品 · 另有 2 个资料位待导入</span></div>
          <div className="product-results">
            {filteredProducts.map((item) => <button key={item.id} className={`product-result ${selectedProductId === item.id ? "selected" : ""}`} onClick={() => chooseProduct(item)}>
              <img src={item.images[0]} alt={item.model} />
              <div><strong>{item.model}　{item.displayName}</strong><span>{item.category}</span><small>来源：产品说明书 · 历史彩页 · 设计源文件</small></div>
              <em>资料完整</em>{selectedProductId === item.id && <i>✓</i>}
            </button>)}
            {filteredProducts.length === 0 && <div className="empty-search">没有找到“{productQuery}”，请检查产品名称或型号。</div>}
            {!productQuery && [2, 3].map((slot) => <div className="product-import-slot" key={slot}><span>＋</span><div><strong>产品 {slot} 资料待导入</strong><small>放入“02-产品资料”后即可接入产品库</small></div><em>待补充</em></div>)}
          </div>
          <div className="product-summary">
            <img src={product.images[1]} alt="PLD-11正面图" />
            <div><h3>{product.model} {product.displayName}</h3><p><b>核心定位：</b>{product.positioning}</p><p><b>核心卖点：</b>自动滤波、频谱分析、精准定位、智能互联</p><p><b>应用领域：</b>{product.applications.slice(0, 5).join("、")}</p></div>
            <span>✓ 信息已校验</span>
          </div>
        </section>
        <div className="flow-actions"><button className="secondary-button" onClick={() => setScreen("materials")}>返回物料中心</button><button className="primary-button" disabled={!selectedProductId} onClick={() => setScreen("confirm")}>确认产品并下一步</button></div>
      </div>
    );
  }

  function renderConfirm() {
    return (
      <div className="flow-page">
        {pageHeader(2)}
        <div className="confirm-heading"><div><h2>确认产品资料</h2><p>以下内容由企业知识库自动提取，请确认后进入模板选择</p></div><span>✓ RAG 检索完成 · 3个资料来源</span></div>
        <div className="confirm-layout">
          <div className="confirm-main">
            <div className="compact-product"><img src={product.images[0]} alt="产品图" /><div><strong>{product.model} {product.displayName}</strong><span>{product.category}</span></div><em>资料完整</em></div>
            <section className="form-card"><h3>基础信息</h3>
              <label>产品名称<input value={product.displayName} onChange={(event) => setProduct({ ...product, displayName: event.target.value })} /></label>
              <label>产品型号<input value={product.model} onChange={(event) => setProduct({ ...product, model: event.target.value })} /></label>
              <label>核心定位<input value={product.positioning} onChange={(event) => setProduct({ ...product, positioning: event.target.value })} /></label>
            </section>
            <section className="form-card"><div className="card-heading"><h3>核心卖点</h3><button onClick={() => notify("已根据说明书重新提炼")}>✦ AI重新提炼</button></div>
              {product.features.map((feature, index) => <label className="numbered-field" key={index}><span>{index + 1}</span><input value={feature} onChange={(event) => updateFeature(index, event.target.value)} /></label>)}
            </section>
          </div>
          <aside className="confirm-aside">
            <section className="asset-card"><h3>产品素材</h3><img className="asset-main" src={product.images[0]} alt="产品主图" /><div className="asset-thumbs">{product.images.map((image) => <img key={image} src={image} alt="产品备选图" />)}</div><button onClick={() => fileInputRef.current?.click()}>更换主图</button></section>
            <section className="source-card"><h3>资料来源</h3>{product.sources.map((source) => <div key={source.name}><span><b>{source.type}</b>{source.name}</span><em>{source.status}</em></div>)}<div className="reference-sources"><b>可参考历史彩页（{referenceLeaflets.length}份）</b>{referenceLeaflets.map((name) => <span key={name}>✓ {name}</span>)}<button className="text-button" onClick={extractLeafletContent}>提取为当前产品文案</button></div></section>
          </aside>
        </div>
        <div className="flow-actions"><button className="secondary-button" onClick={() => setScreen("select")}>返回上一步</button><button className="primary-button" onClick={() => setScreen("template")}>确认资料，选择模板</button></div>
      </div>
    );
  }

  function renderTemplate() {
    return (
      <div className="flow-page">
        {pageHeader(3)}
        <div className="template-heading"><div><h2>选择公司模板</h2><p>仅展示公司已审核模板，确保品牌风格与商用规范统一</p></div><span>✓ 产品资料已确认</span></div>
        <div className="compact-product template-product"><img src={product.images[0]} alt="产品图" /><div><strong>{product.model} {product.displayName}</strong><span>产品说明书、历史彩页及产品图片已就绪</span></div><button className="text-button" onClick={() => setScreen("confirm")}>查看产品资料 →</button></div>
        <div className="template-filter"><button className="active">全部</button><button>宣传单页</button><button>双页彩页</button><button>三折页</button><span>尺寸：A4竖版⌄</span><span>场景：产品介绍⌄</span></div>
        <h3>公司已审核模板</h3>
        <div className="template-gallery">
          <button className={`real-template ${selectedTemplate ? "selected" : ""}`} onClick={() => setSelectedTemplate(true)}>
            <div className="duplex-preview"><img src={templateSeed.previews[0]} alt="彩页第一页" /><img src={templateSeed.previews[1]} alt="彩页第二页" /></div>
            <div><strong>{templateSeed.name}</strong><span>A4竖版 · 正反两页 · 品牌标准</span></div><em>推荐</em>{selectedTemplate && <i>✓</i>}
          </button>
          <button className="empty-template" onClick={() => notify("更多公司模板将在后续导入")}><span>＋</span><strong>导入更多公司模板</strong><small>支持AI / PSD源文件拆解</small></button>
        </div>
        <div className="selected-template-bar"><img src={templateSeed.previews[0]} alt="已选模板" /><div><b>已选择：{templateSeed.name}</b><span>适用于产品介绍、销售资料与展会宣传</span></div><em>二维码、Logo、背景及品牌装饰已锁定</em></div>
        <div className="flow-actions"><button className="secondary-button" onClick={() => setScreen("confirm")}>返回确认资料</button><button className="primary-button" onClick={() => setScreen("edit")}>使用此模板，开始编辑</button></div>
      </div>
    );
  }

  function renderEditor() {
    return (
      <div className="editor-page">
        <div className="editor-topbar">
          <div><div className="breadcrumb">平面物料　/　产品宣传彩页　/　新建彩页</div><h1>{product.model} {product.displayName}彩页</h1></div>
          <Stepper step={4} />
          <div className="editor-actions"><button onClick={extractLeafletContent}>✦ 从彩页提取内容</button><button onClick={() => setPreviewOpen(true)}>◉ 预览</button><button onClick={saveDraft}>▣ 保存草稿</button><button className="primary-button" onClick={submitReview}>提交审核</button></div>
        </div>
        <div className="editor-workspace">
          <aside className="layers-panel">
            <h3>页面与图层</h3><div className="panel-tabs"><button>页面</button><button className="active">图层</button></div>
            <div className="page-thumbnails">
              {[1, 2].map((page) => <button key={page} className={currentPage === page ? "active" : ""} onClick={() => setCurrentPage(page)}><img src={templateSeed.previews[page - 1]} alt={`第${page}页`} /><span>0{page} {page === 1 ? "产品介绍" : "技术参数"}</span></button>)}
            </div>
            <div className="layer-add-actions"><button onClick={addCustomText}>＋ 添加文字</button><button onClick={() => setSelectedLayer("图片素材")}>＋ 添加图片</button></div>
            <div className="layer-list">{layers.map((layer) => <button key={layer.id} className={selectedLayer === layer.id ? "active" : ""} onClick={() => { setSelectedLayer(layer.id); if (layer.id === "参数表" || layer.id === "测试标准") setCurrentPage(pageAssignments[layer.id] ?? 2); if (layer.id.startsWith("custom:")) setCurrentPage(customTexts.find((item) => item.id === layer.id.slice(7))?.page ?? 1); if (layer.id.startsWith("image:")) setCurrentPage(freeImages.find((item) => item.id === layer.id.slice(6))?.page ?? 1); }}><span>{layer.id === "产品主图" || layer.id === "图片素材" || layer.id.startsWith("image:") ? "▧" : layer.id === "参数表" ? "▦" : "T"}</span>{layer.label}<em>{layer.id === "品牌标识" || layer.id === "背景" ? "🔒" : "◉"}</em></button>)}</div>
            <button className="history-button" onClick={() => setHistoryOpen(!historyOpen)}>▥ 对话历史</button>
          </aside>
          <main className="canvas-area">
            <div className="canvas-toolbar"><span>⌕　80%⌄</span><span>⊞ 适应画布</span><span>▦ 参考线</span><em>● 自动保存</em></div>
            <div className="canvas-stage">
              <LeafletPage page={currentPage} product={product} selectedLayer={selectedLayer} imageScale={imageScale} imageX={imageX} imageY={imageY} titleSize={titleSize} titleColor={titleColor} textStyles={textStyles} pageAssignments={pageAssignments} standards={standards} customTexts={customTexts} freeImages={freeImages} editable onSelectProduct={() => setSelectedLayer("产品主图")} onMoveProduct={(deltaX, deltaY) => { setImageX((value) => Math.max(-160, Math.min(160, value + deltaX))); setImageY((value) => Math.max(-160, Math.min(160, value + deltaY))); }} onSelectText={setSelectedLayer} onMoveText={moveTextLayer} onMoveFreeImage={moveFreeImage} onUpdateParameter={updateParameter} />
            </div>
            <div className="assistant-bar"><input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runAssistant()} placeholder="输入修改要求，例如：产品图放大10%，标题向上移动…" /><button>添加资料</button><button>参考图</button><button title="语音输入">◉</button><button className="send-button" onClick={runAssistant}>➤</button></div>
            {historyOpen && <div className="chat-history"><div><strong>AI修改记录</strong><button onClick={() => setHistoryOpen(false)}>×</button></div>{chatHistory.map((message, index) => <p key={`${message}-${index}`}><span>{index === 0 ? "AI" : "我"}</span>{message}</p>)}</div>}
          </main>
          <aside className="properties-panel">
            <h3>{selectedLayer === "产品主图" || selectedLayer === "图片素材" || selectedFreeImage ? "图片设置" : selectedLayer === "背景" || selectedLayer === "品牌标识" ? "模板锁定项" : "文字设置"}</h3>
            {(["产品介绍", "核心卖点", "被测对象", "应用领域", "测试标准", "参数表"].includes(selectedLayer) || selectedCustomText) && <div className="page-switch"><span>所在页面</span><button className={(selectedCustomText?.page ?? pageAssignments[selectedLayer]) === 1 ? "active" : ""} onClick={() => moveLayerToPage(selectedLayer, 1)}>第 1 页</button><button className={(selectedCustomText?.page ?? pageAssignments[selectedLayer]) === 2 ? "active" : ""} onClick={() => moveLayerToPage(selectedLayer, 2)}>第 2 页</button></div>}
            {selectedLayer === "产品标题" && <>
              <label>文本内容<textarea value={`${product.model} ${product.displayName}`} onChange={(event) => { const value = event.target.value; setProduct({ ...product, displayName: value.replace(product.model, "").trim() }); }} /></label>
              <div className="property-row"><label>字体<select><option>阿里巴巴普惠体</option></select></label><label>字号<input type="number" value={titleSize} onChange={(event) => setTitleSize(Number(event.target.value))} /></label></div>
              <div className="format-buttons"><button className="active">B</button><button>I</button><button>U</button><button>左</button><button>中</button><button>右</button></div>
              <label>文字颜色<input type="color" value={titleColor} onChange={(event) => setTitleColor(event.target.value)} /></label>
              <label>水平位置<input type="range" min="-120" max="120" value={textStyles["产品标题"]?.x ?? 0} onChange={(event) => updateTextStyle("产品标题", { x: Number(event.target.value) })} /></label>
              <label>垂直位置<input type="range" min="-120" max="120" value={textStyles["产品标题"]?.y ?? 0} onChange={(event) => updateTextStyle("产品标题", { y: Number(event.target.value) })} /></label>
              <button className="text-button" onClick={() => updateTextStyle("产品标题", defaultTextStyles["产品标题"])}>恢复标题默认位置</button>
            </>}
            {["产品介绍", "核心卖点", "被测对象", "应用领域"].includes(selectedLayer) && <>
              <p className="property-note">选中画布中的文字段可直接拖动；以下设置会作用于当前文字段。</p>
              <div className="property-row"><label>字体<select value={textStyles[selectedLayer]?.fontFamily ?? "Alibaba PuHuiTi"} onChange={(event) => updateTextStyle(selectedLayer, { fontFamily: event.target.value })}><option>Alibaba PuHuiTi</option><option>Arial</option><option>Microsoft YaHei</option><option>SimSun</option></select></label><label>字号<input type="number" min="1" max="4" step="0.1" value={textStyles[selectedLayer]?.fontSize ?? 1.72} onChange={(event) => updateTextStyle(selectedLayer, { fontSize: Number(event.target.value) })} /></label></div>
              <label>字重<select value={textStyles[selectedLayer]?.fontWeight ?? 400} onChange={(event) => updateTextStyle(selectedLayer, { fontWeight: Number(event.target.value) })}><option value={300}>细体 300</option><option value={400}>常规 400</option><option value={500}>中等 500</option><option value={700}>粗体 700</option></select></label>
              <label>水平位置<input type="range" min="-120" max="120" value={textStyles[selectedLayer]?.x ?? 0} onChange={(event) => updateTextStyle(selectedLayer, { x: Number(event.target.value) })} /></label>
              <label>垂直位置<input type="range" min="-120" max="120" value={textStyles[selectedLayer]?.y ?? 0} onChange={(event) => updateTextStyle(selectedLayer, { y: Number(event.target.value) })} /></label>
              <button className="text-button" onClick={() => updateTextStyle(selectedLayer, defaultTextStyles[selectedLayer])}>恢复文字默认位置与样式</button>
            </>}
            {selectedLayer === "产品介绍" && <><label>产品介绍<textarea rows={9} value={product.summary} onChange={(event) => setProduct({ ...product, summary: event.target.value })} /></label><button className="secondary-button wide" onClick={extractLeafletContent}>从彩页提取建议文案</button></>}
            {selectedLayer === "核心卖点" && <><div>{product.features.map((feature, index) => <label key={index}>卖点 {index + 1}<textarea rows={2} value={feature} onChange={(event) => updateFeature(index, event.target.value)} /></label>)}</div><button className="secondary-button wide" onClick={extractLeafletContent}>从彩页提取建议卖点</button></>}
            {selectedLayer === "应用领域" && <label>应用领域<textarea rows={6} value={product.applications.join("、")} onChange={(event) => setProduct({ ...product, applications: event.target.value.split(/[、,，]/).filter(Boolean) })} /></label>}
            {selectedLayer === "产品主图" && <>
              <p className="property-note">可直接拖动画布中的产品图，也可以使用下方按钮精确调整。</p>
              <img className="property-image" src={product.images[0]} alt="当前产品主图" />
              <div className="property-image-options">{product.images.map((src, index) => <button key={src} className={index === 0 ? "active" : ""} onClick={() => makePrimaryImage(index)}><img src={src} alt={`产品备选图${index + 1}`} /><span>{index === 0 ? "当前主图" : "设为主图"}</span></button>)}</div>
              <button className="secondary-button wide" onClick={() => fileInputRef.current?.click()}>上传并更换产品图片</button>
              <div className="image-quick-controls"><button onClick={() => setImageScale((value) => Math.max(50, value - 10))}>－ 缩小</button><button onClick={() => setImageScale(100)}>100%</button><button onClick={() => setImageScale((value) => Math.min(180, value + 10))}>＋ 放大</button></div>
              <label>缩放 {imageScale}%<input type="range" min="60" max="140" value={imageScale} onChange={(event) => setImageScale(Number(event.target.value))} /></label>
              <label>水平位置<input type="range" min="-80" max="80" value={imageX} onChange={(event) => setImageX(Number(event.target.value))} /></label>
              <label>垂直位置<input type="range" min="-80" max="80" value={imageY} onChange={(event) => setImageY(Number(event.target.value))} /></label>
              <div className="position-pad"><span /><button onClick={() => setImageY((value) => value - 8)}>↑</button><span /><button onClick={() => setImageX((value) => value - 8)}>←</button><button onClick={() => { setImageX(0); setImageY(0); }}>●</button><button onClick={() => setImageX((value) => value + 8)}>→</button><span /><button onClick={() => setImageY((value) => value + 8)}>↓</button><span /></div>
              <button className="text-button" onClick={() => { setImageScale(100); setImageX(0); setImageY(0); }}>恢复模板位置</button>
            </>}
            {selectedLayer === "图片素材" && <><p className="property-note">画布不再自动放置三张界面图。请从推荐素材中选择，或上传自己的图片。</p><button className="secondary-button wide" onClick={() => screenFileInputRef.current?.click()}>上传本地图片</button><h4>产品图</h4><div className="recommended-grid">{product.images.map((src, index) => <button key={src} onClick={() => addRecommendedImage(src, `产品图 ${index + 1}`, "产品图")}><img src={src} alt={`推荐产品图${index + 1}`} /><span>添加到第 {currentPage} 页</span></button>)}</div>{product.screens.length > 0 && <><h4>操作界面图</h4><div className="recommended-grid">{product.screens.map((src, index) => <button key={src} onClick={() => addRecommendedImage(src, `操作界面图 ${index + 1}`, "操作界面图")}><img src={src} alt={`推荐界面图${index + 1}`} /><span>添加到第 {currentPage} 页</span></button>)}</div></>}<div className="recommend-placeholder"><b>功能图、应用场景图</b><span>后续接入企业素材库后按产品自动推荐</span></div></>}
            {selectedFreeImage && <><img className="property-image" src={selectedFreeImage.src} alt={selectedFreeImage.name} /><label>素材名称<input value={selectedFreeImage.name} onChange={(event) => setFreeImages((items) => items.map((item) => item.id === selectedFreeImage.id ? { ...item, name: event.target.value } : item))} /></label><div className="page-switch"><span>所在页面</span><button className={selectedFreeImage.page === 1 ? "active" : ""} onClick={() => { setFreeImages((items) => items.map((item) => item.id === selectedFreeImage.id ? { ...item, page: 1 } : item)); setCurrentPage(1); }}>第 1 页</button><button className={selectedFreeImage.page === 2 ? "active" : ""} onClick={() => { setFreeImages((items) => items.map((item) => item.id === selectedFreeImage.id ? { ...item, page: 2 } : item)); setCurrentPage(2); }}>第 2 页</button></div><label>图片宽度 {Math.round(selectedFreeImage.width)}%<input type="range" min="10" max="80" value={selectedFreeImage.width} onChange={(event) => setFreeImages((items) => items.map((item) => item.id === selectedFreeImage.id ? { ...item, width: Number(event.target.value) } : item))} /></label><button className="danger-button wide" onClick={() => { setFreeImages((items) => items.filter((item) => item.id !== selectedFreeImage.id)); setSelectedLayer("图片素材"); }}>删除这张图片</button></>}
            {selectedLayer === "测试标准" && <><p className="property-note">测试标准应来自当前产品资料；系统未识别到可靠内容时不会自动编造。</p>{standards.map((standard, index) => <div className="editable-row" key={index}><textarea rows={3} value={standard} onChange={(event) => setStandards((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><button onClick={() => setStandards((items) => items.filter((_, itemIndex) => itemIndex !== index))}>删除</button></div>)}<button className="secondary-button wide" onClick={() => setStandards((items) => [...items, "请输入测试标准名称、编号及适用条款"])}>＋ 添加测试标准</button><div className="property-row"><label>字号<input type="number" min="0.9" max="3" step="0.1" value={textStyles["测试标准"]?.fontSize ?? 1.45} onChange={(event) => updateTextStyle("测试标准", { fontSize: Number(event.target.value) })} /></label><label>缩放<input type="number" min="0.7" max="1.4" step="0.05" value={textStyles["测试标准"]?.scale ?? 1} onChange={(event) => updateTextStyle("测试标准", { scale: Number(event.target.value) })} /></label></div></>}
            {selectedCustomText && <><label>模块标题<input value={selectedCustomText.title} onChange={(event) => setCustomTexts((items) => items.map((item) => item.id === selectedCustomText.id ? { ...item, title: event.target.value } : item))} /></label><label>文字内容<textarea rows={8} value={selectedCustomText.content} onChange={(event) => setCustomTexts((items) => items.map((item) => item.id === selectedCustomText.id ? { ...item, content: event.target.value } : item))} /></label><label>字号<input type="number" min="0.9" max="4" step="0.1" value={selectedCustomText.fontSize} onChange={(event) => setCustomTexts((items) => items.map((item) => item.id === selectedCustomText.id ? { ...item, fontSize: Number(event.target.value) } : item))} /></label><label>文字框宽度<input type="range" min="18" max="90" value={selectedCustomText.width} onChange={(event) => setCustomTexts((items) => items.map((item) => item.id === selectedCustomText.id ? { ...item, width: Number(event.target.value) } : item))} /></label><button className="danger-button wide" onClick={() => { setCustomTexts((items) => items.filter((item) => item.id !== selectedCustomText.id)); setSelectedLayer("产品介绍"); }}>删除这个文字模块</button></>}
            {selectedLayer === "参数表" && <><p className="property-note">技术参数表可在画布中拖动，也可以增加、删除参数行。</p><div className="property-row"><label>字体<select value={textStyles["参数表"]?.fontFamily ?? "Alibaba PuHuiTi"} onChange={(event) => updateTextStyle("参数表", { fontFamily: event.target.value })}><option>Alibaba PuHuiTi</option><option>Arial</option><option>Microsoft YaHei</option><option>SimSun</option></select></label><label>字号<input type="number" min="0.8" max="2.5" step="0.1" value={textStyles["参数表"]?.fontSize ?? 1.35} onChange={(event) => updateTextStyle("参数表", { fontSize: Number(event.target.value) })} /></label></div><label>整体缩放<input type="range" min="0.7" max="1.4" step="0.05" value={textStyles["参数表"]?.scale ?? 1} onChange={(event) => updateTextStyle("参数表", { scale: Number(event.target.value) })} /></label><label>水平位置<input type="range" min="-120" max="120" value={textStyles["参数表"]?.x ?? 0} onChange={(event) => updateTextStyle("参数表", { x: Number(event.target.value) })} /></label><label>垂直位置<input type="range" min="-120" max="120" value={textStyles["参数表"]?.y ?? 0} onChange={(event) => updateTextStyle("参数表", { y: Number(event.target.value) })} /></label><div className="parameter-editor">{product.parameters.map(([key, value], index) => <div key={`${key}-${index}`}><input value={key} onChange={(event) => updateParameter(index, event.target.value, value)} /><input value={value} onChange={(event) => updateParameter(index, key, event.target.value)} /><button onClick={() => deleteParameter(index)}>×</button></div>)}</div><button className="secondary-button wide" onClick={addParameter}>＋ 添加参数</button><button className="text-button" onClick={() => updateTextStyle("参数表", defaultTextStyles["参数表"])}>恢复参数表默认位置与样式</button></>}
            {(selectedLayer === "背景" || selectedLayer === "品牌标识") && <div className="locked-property"><span>🔒</span><strong>{selectedLayer}已锁定</strong><p>为保证品牌一致性，该元素不能在一期编辑器中修改。</p><small>固定内容：Logo、品牌装饰、底部口号、二维码</small></div>}
            <div className="property-footer"><span>自动保存于本机</span><button onClick={() => notify("已恢复模板默认样式")}>恢复模板样式</button></div>
          </aside>
        </div>
      </div>
    );
  }

  function renderAdminConsole() {
    const summaries = [
      ["成员", "平台成员", "24", "blue"],
      ["待", "待审核", "3", "orange"],
      ["模", "启用模板", "12", "green"],
      ["库", "知识资料", "86", "purple"],
      ["容", "素材空间", "68%", "blue"],
    ];
    const quickNotify = (name: string) => notify(`已打开${name}，当前为本地演示功能`);
    return (
      <div className="admin-console-page">
        <div className="admin-title-row"><div><h1>平台管理控制台</h1><p>统一管理平台成员、业务流程、企业模板与系统配置</p></div><button className="primary-button" onClick={() => quickNotify("邀请成员窗口")}>＋ 邀请成员</button></div>
        <div className="admin-summary-grid">{summaries.map(([icon, label, value, tone]) => <article key={label}><span className={`admin-summary-icon ${tone}`}>{icon}</span><div><b>{label}</b><strong>{value}</strong></div></article>)}</div>
        <div className="admin-module-grid">
          <section className="admin-module-card"><h2><span>♙</span>1. 用户与角色</h2><div className="admin-role-grid"><span>产品经理 <b>3</b></span><span>文案 <b>2</b></span><span>设计师 <b>4</b></span><span>运营 <b>5</b></span></div><button onClick={() => quickNotify("成员与权限管理")}>管理成员</button></section>
          <section className="admin-module-card admin-flow-card"><h2><span>⌘</span>2. 审核流程</h2><div className="admin-flow"><span><i>文</i><b>文案确认</b></span><em>→</em><span><i>设</i><b>设计制作</b></span><em>→</em><span><i>AI</i><b>AI审核</b></span><em>→</em><span><i>人</i><b>业务确认</b></span><em>→</em><span><i>档</i><b>自动归档</b></span></div><button onClick={() => quickNotify("审核流程配置")}>配置流程</button></section>
          <section className="admin-module-card admin-template-card"><h2><span>▦</span>3. 模板管理</h2><div className="admin-template-tabs"><span>产品彩页 <b>4</b></span><span>海报 <b>5</b></span><span>视频模板 <b>3</b></span></div><div className="admin-template-previews"><button onClick={() => setScreen("template")}><img src={templateSeed.previews[0]} alt="产品彩页模板" /><span><b>产品彩页模板</b><small>仪器设备系列</small></span></button><button onClick={() => setScreen("poster-templates")}><img src="/assets/posters/product-houyi.jpg" alt="海报模板" /><span><b>海报模板</b><small>新品发布系列</small></span></button></div><button onClick={() => quickNotify("企业模板管理")}>管理模板</button></section>
          <section className="admin-module-card admin-settings-list"><h2><span>✦</span>4. AI能力配置</h2><div><span>文案生成 <em className="enabled">已启用</em></span><span>产品问答 <em className="enabled">已启用</em></span><span>图片推荐 <em className="demo">演示模式</em></span><span>视频生成 <em>待接入</em></span></div><button onClick={() => quickNotify("AI能力设置")}>能力设置</button></section>
          <section className="admin-module-card admin-brand-settings"><h2><span>♢</span>5. 企业与品牌设置</h2><div><button onClick={() => { setKnowledgeView("brand"); setScreen("knowledge"); }}><span>企业 Logo</span><b><img src="/assets/brand/logo.png" alt="KGT Logo" /> KGT　›</b></button><button onClick={() => { setKnowledgeView("brand"); setScreen("knowledge"); }}><span>标准色</span><b className="brand-swatches"><i /><i /><i />　›</b></button><button onClick={() => quickNotify("企业二维码设置")}><span>二维码</span><b>▦　›</b></button><button onClick={() => quickNotify("导出规范设置")}><span>导出规范</span><b>PDF / PNG 300dpi　›</b></button></div><button onClick={() => quickNotify("企业与系统设置")}>系统设置</button></section>
          <section className="admin-module-card admin-log-card"><h2><span>♢</span>6. 操作与安全</h2><div className="admin-log-table"><header><span>操作人</span><span>操作内容</span><span>时间</span></header><p><span>张三</span><span>更新产品模板</span><span>今天 10:24</span></p><p><span>李娜</span><span>审核 PLD-11 彩页</span><span>今天 09:18</span></p><p><span>系统</span><span>自动归档素材</span><span>昨天 18:36</span></p></div><button onClick={() => quickNotify("平台操作日志")}>查看日志</button></section>
        </div>
        <section className="admin-system-status"><h2>▣　系统运行状态</h2><div><span><i />前端服务<small>正常</small></span><span><i />本地知识库<small>正常</small></span><span><i />AI接口<small>演示模式</small></span><span><i />最近备份<small>今日 09:30</small></span></div></section>
      </div>
    );
  }

  function renderProjects() {
    return (
      <div className="content-page">
        <div className="breadcrumb">首页　/　项目　/　彩页项目</div>
        <div className="page-title-row"><div><h1>彩页项目</h1><p>管理草稿、审核任务与已完成彩页</p></div><button className="primary-button" onClick={() => setScreen("select")}>＋ 新建彩页</button></div>
        <div className="project-tabs"><button className="active">全部项目</button><button>草稿</button><button>待审核</button><button>已完成</button></div>
        <div className="project-table">
          <div className="project-table-head"><span>项目</span><span>模板</span><span>更新时间</span><span>状态</span><span>操作</span></div>
          <div className="project-row">
            <div className="project-name"><img src={templateSeed.previews[0]} alt="彩页缩略图" /><span><b>{product.model} {product.displayName}彩页</b><small>创建人：张三 · 两页A4</small></span></div>
            <span>{templateSeed.name}</span><span>刚刚</span><StatusPill status={status} />
            <div className="row-actions">
              {status === "草稿" && <button onClick={() => setScreen("edit")}>继续编辑</button>}
              {status === "待审核" && <><button onClick={() => setPreviewOpen(true)}>查看彩页</button><button className="approve-button" onClick={approve}>模拟审核通过</button></>}
              {status === "已通过" && <><button onClick={() => setScreen("edit")}>查看/编辑</button><button className="approve-button" onClick={exportPng}>导出双页PNG</button><button onClick={() => window.print()}>打印/PDF</button></>}
            </div>
          </div>
        </div>
        <div className="review-tip"><span>审核演示说明</span><p>本地原型中点击“模拟审核通过”即可验证审核后导出；正式版将根据账号权限展示审核操作。</p></div>
      </div>
    );
  }

  if (screen === "landing") return renderLanding();

  const activeNav = screen === "home" ? "home" : screen === "materials" || ["select", "confirm", "template", "edit", "poster-home", "poster-templates", "poster-editor"].includes(screen) ? "materials" : ["video-home", "video-learning", "video-create"].includes(screen) ? "video" : screen === "qa" ? "qa" : screen === "team" ? "team" : screen === "assets" ? "assets" : screen === "knowledge" ? "knowledge" : screen === "admin" ? "admin" : screen === "projects" ? "projects" : "";

  return (
    <>
      <div className="app-shell">
        <aside className="global-nav">
          <button className="brand-mark" onClick={() => setScreen("home")}><img src="/assets/brand/logo.png" alt="KGT" /></button>
          <nav>{navItems.map(([key, icon, label]) => <button key={key} className={activeNav === key ? "active" : ""} onClick={() => handleNav(key, label)}><span>{icon}</span>{label}</button>)}</nav>
        </aside>
        <div className="app-main">
          <header className="app-header"><div><strong>北京康高特仪器设备有限公司</strong><span>内部试用</span></div><div className="header-user"><button onClick={() => setScreen("projects")}>待审核 <b>{status === "待审核" ? 1 : 0}</b></button><i>张</i><span>张三　⌄</span></div></header>
          <div className="app-content">
            {screen === "home" && renderHome()}
            {screen === "materials" && renderMaterials()}
            {screen === "poster-home" && renderPosterHome()}
            {screen === "poster-templates" && renderPosterTemplates()}
            {screen === "poster-editor" && renderPosterEditor()}
            {screen === "video-home" && renderVideoHome()}
            {screen === "video-learning" && renderVideoLearning()}
            {screen === "video-create" && renderVideoCreate()}
            {screen === "qa" && renderQa()}
            {screen === "team" && renderTeamWorkspace()}
            {screen === "assets" && renderAssetLibrary()}
            {screen === "knowledge" && renderKnowledgeCenter()}
            {screen === "admin" && renderAdminConsole()}
            {screen === "select" && renderSelect()}
            {screen === "confirm" && renderConfirm()}
            {screen === "template" && renderTemplate()}
            {screen === "edit" && renderEditor()}
            {screen === "projects" && renderProjects()}
            {screen === "placeholder" && <Placeholder title={placeholderTitle} onBack={() => setScreen("home")} />}
          </div>
        </div>
        <input id="product-image-upload" ref={fileInputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { uploadProductImage(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        <input ref={screenFileInputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { uploadFreeImage(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        <input ref={posterFileInputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { uploadPosterAsset(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        {toast && <div className="toast">✓ {toast}</div>}
        {previewOpen && <div className="preview-modal" role="dialog" aria-modal="true"><div className="preview-header"><div><strong>彩页预览</strong><span>{product.model} {product.displayName} · A4双页</span></div><button onClick={() => setPreviewOpen(false)}>×</button></div><div className="preview-pages"><LeafletPage page={1} product={product} imageScale={imageScale} imageX={imageX} imageY={imageY} titleSize={titleSize} titleColor={titleColor} textStyles={textStyles} pageAssignments={pageAssignments} standards={standards} customTexts={customTexts} freeImages={freeImages} /><LeafletPage page={2} product={product} imageScale={imageScale} imageX={imageX} imageY={imageY} titleSize={titleSize} titleColor={titleColor} textStyles={textStyles} pageAssignments={pageAssignments} standards={standards} customTexts={customTexts} freeImages={freeImages} /></div><div className="preview-footer"><StatusPill status={status} /><button className="secondary-button" onClick={() => setPreviewOpen(false)}>关闭预览</button>{status === "已通过" && <button className="primary-button" onClick={exportPng}>导出两页PNG</button>}</div></div>}
        {posterPreviewOpen && <div className="poster-preview-modal" role="dialog" aria-modal="true"><div className="preview-header"><div><strong>海报预览</strong><span>{selectedPoster.name} · 1080 × 1920</span></div><button onClick={() => setPosterPreviewOpen(false)}>×</button></div><div className="poster-preview-body"><div><img src={posterCanvasSrc} alt={selectedPoster.name} /><div style={{ color: posterTitleColor, fontSize: `${posterTitleSize / 8}px`, transform: `translate(${posterTitleX / 5}px, ${posterTitleY / 5}px)` }}><strong>{posterTitle}</strong><span>{posterSubtitle}</span></div></div></div><div className="preview-footer"><button className="secondary-button" onClick={() => setPosterPreviewOpen(false)}>关闭预览</button><button className="primary-button" onClick={exportPosterPng}>导出 PNG</button></div></div>}
      </div>
      <div className="print-sheet"><LeafletPage page={1} product={product} imageScale={imageScale} imageX={imageX} imageY={imageY} titleSize={titleSize} titleColor={titleColor} textStyles={textStyles} pageAssignments={pageAssignments} standards={standards} customTexts={customTexts} freeImages={freeImages} /><LeafletPage page={2} product={product} imageScale={imageScale} imageX={imageX} imageY={imageY} titleSize={titleSize} titleColor={titleColor} textStyles={textStyles} pageAssignments={pageAssignments} standards={standards} customTexts={customTexts} freeImages={freeImages} /></div>
    </>
  );
}

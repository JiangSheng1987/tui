﻿////////////////////////////////////////////////////////////////////
ExportElementXMLErrorStrings = {};
ExportElementXMLErrorStrings.kNoOpenedFla = "no opened fla document!";
ExportElementXMLErrorStrings.kNullDocument = "export error, empty document!";
ExportElementXMLErrorStrings.kNoSetScheme = "export error, no such scheme!";
ExportElementXMLErrorStrings.kCanNotFindLibraryItem = "can not find library item!";
/////////////////////////////////////////////////////////////////////
/*给函数原型增加一个extend函数，实现继承*/  
Function.prototype.extend = function(superClass){  
	if(typeof superClass !== 'function'){  
		throw new Error('fatal error:Function.prototype.extend expects a constructor of class');  
	}  

	var F = function(){}; //创建一个中间函数对象以获取父类的原型对象  
	F.prototype = superClass.prototype; //设置原型对象  
	this.prototype = new F(); //实例化F, 继承父类的原型中的属性和方法，而无需调用父类的构造函数实例化无关的父类成员  
	this.prototype.constructor = this; //设置构造函数指向自己  
	this.superClass = superClass; //同时，添加一个指向父类构造函数的引用，方便调用父类方法或者调用父类构造函数  

    return this;
};

/**
 @brief 打印
 @param str:string 字符串
 */
function trace( str ){
	fl.outputPanel.trace( str );
}

/** 清屏 */
function cls(){
	fl.outputPanel.clear();
}

/** 保留小数 */
function formatNumber( num, retain){
	retain = retain || 100;
	return Math.round(num * retain) / 100;
}

/** 把一个库目录里的资源转换为资源的绝对目录 */
function getFilePathByLibraryPath( path ){
	if( path == null || path == "" || path == undefined ){
		alert( "getFilePathByLibraryPath 无效的参数" );
	}
	var lib = fl.getDocumentDOM().library;
	var item_index = lib.findItemIndex( path );
	if( item_index < 0 ){
		alert( ExportElementXMLErrorStrings.kCanNotFindLibraryItem + ": " + path );
	}
	var item = lib.items[item_index];
	var url = item.sourceFilePath;
	url = url.replace( "file:///", "" );
	url = url.replace( "|", ":" );
	//for ( var i in item ){
	//	trace( "" + i + "" + ":" + item[i] );
	//}
	//trace( "转换路径 " + path + "===>>" + url );
	return url;
}

/**
 @brief 获取当前文档的时间轴
 @return Timeline object
 */
getCurrentTimeline = function(){
	try{
		return fl.getDocumentDOM().getTimeline();
	}catch(e){
		alert( ExportElementXMLErrorStrings.kNoOpenedFla );
	}
	return null;
}

/** 
 @brief 判断一个帧是否是关键帧, 原理是每个关键帧总是一序列帧的第一帧
 @param frame:Frame object 帧对象
 @param frameIndex:int 该帧的索引号
 @return boolean
 */
isKeyFrame = function( frame, frameIndex ){
	if( !frame ) return false;
	if( frame.startFrame == frameIndex ){
		return true;
	}
	return false;
}

/**
 @brief 把某个图层的关键帧枚举出来
 @param layer: Layer object 图层对象
 @param startFrameIndex:int 起始帧数，不一定是从0开始
 @param endFrameIndex:int 结束帧数
 @return vector<int>: 范围[startFrameIndex,endFrameIndex)之间的关键帧索引号数组
 */
getKeyframeIndices = function(layer, startFrameIndex, endFrameIndex){
	if( !layer ) return [];
	var list = [];
	for (var frameIndex=startFrameIndex; frameIndex<endFrameIndex; frameIndex++){
		var frame = layer.frames[frameIndex];
		var isFirstFrame = (frameIndex == startFrameIndex);
		var isKeyframe = (isFirstFrame || frame.startFrame == frameIndex);
	//	if (isKeyframe){
	//		list[frameIndex] = true;
	//	}else{
	//		list[frameIndex] = false;
	//	}
		if( isKeyframe ){
			list.push( frameIndex );
		}
	}
	return list;
}
/**
 @brief 获取某个图层的所有关键帧
 @param layer:Layer object 图层对象
 @return vector<Frame object>
 */
getKeyframeObjects = function( layer ){
	if( !layer ) return [];
	var list = [];
	var index = 0;
	for each( frame in layer.frames ){
		if( frame.startFrame == index ){
			list.push( frame );
		}
		index++;
	}
	return list;
}
/**
 @brief 获取一个帧上的所有元素
 @param frame:Frame object 帧对象
 @return vector<Element object> 该帧上的所有元素
 */
getElementObjects = function( frame ){
	if( !frame ) return [];
	return frame.elements;
}
/**
 @brief 获取元素的类型
 @param element:Element object 元素对象
 @return string 类型
 */
getElementType = function(element){
	if (!element) return '';

	var elementType = '';
	var libraryItem = element.libraryItem;
	// element.elementType: "shape", "text", "instance", or "shapeObj"
	// item.itemType: "undefined", "component", "movie clip", "graphic", "button", "folder", "font", "sound", "bitmap", "compiled clip", "screen", and "video".
	switch (element.elementType){
	case 'shape' :
		{
			//NOTE: a drawing object is both a group and a drawing object, so check it first
			elementType = element.isRectangleObject ? 'rectangle object'
						: element.isOvalObject ? 'oval object'
						: element.isDrawingObject ? 'drawing object'
						: element.isGroup ? 'group'
						: 'shape';
		}break;
	case 'shapeObj' :
		{
			elementType = 'shape object'; 
		}break;
	case 'text' :
		{
			elementType = 'text'; 
		}break;
	case 'instance' :
		{
			if (element.symbolType)
				elementType = element.symbolType;
			else if (libraryItem.itemType && libraryItem.itemType != 'undefined')
				elementType = libraryItem.itemType;
		}break;
	}
	return elementType;
}

/** 精减小数 */
roundToTwip = function(value){
	return Math.round(value*20) / 20;
}

/** 获取元素的x坐标 */
getX = function(element){
	return roundToTwip(element.transformX);
}

/** 获取元素的y坐标 */
getY = function(element){
	return roundToTwip(element.transformY);
}

/** 设置元素的x坐标 */
setX = function(element, x){
	element.transformX = x;
}

/** 设置元素的y坐标 */
setY = function(element, y){
	element.transformY = y;
}
/////////////////////////////////////////////////////////////////////
/* tag映射头文件 */
TH = function(){
	this.obj = new Object();
	this.parseContent = function(){
		var content = "#ifndef __TAG_TUI__ \r\n#define __TAG_TUI__ \r\n\r\n";
		for(var key in this.obj){
			content += "static const int "+key.toUpperCase()+" = "+this.obj[key]+" ;\r\n";
		}
		content += "\r\n#endif";
		return content;
	}
}
/////////////////////////////////////////////////////////////////////
/** 默认的xml 节点名字 */
XMLNode = {};
XMLNode.root = "root";
XMLNode.control = "control";
XMLNode.scheme = "scheme";
/////////////////////////////////////////////////////////////////////
/** xml类 */
TXML = function( nodename ){
	/** 父节点 */
	this.parent = null;
	/** 子节点 */
	this.children = [];
	/** 所有需要输出的属性 */
	this.attributes = {};
	
	this.xml = "";
	this.nodeName = nodename==null ? XMLNode.root : nodename;
	
	this.init();
}

TXML.prototype.init = function(){
}

TXML.prototype.setNodeName = function( name ){
	this.nodeName = name;
}

TXML.prototype.getNodeName = function(){
	return this.nodeName;
}

TXML.prototype.addChild = function( o ){
	if( !o ){
		alert( o );
	}
	o.parent = this;
	this.children.push( o );
}

TXML.prototype.registerAttribute = function( k, v ){
	this.attributes[k] = v;
}

TXML.prototype.setAttribute = function( k, v ){
	if( this.attributes[k] == null ){
		alert( "没有属性: " + k );
	}
	this.attributes[k] = v;
}

TXML.prototype.getAttribute = function( k ){
	if( this.attributes[k] == null ){
		alert( "没有属性: " + k );
	}
	return this.attributes[k];
}

TXML.prototype.getTabCount = function(){
	if( this.parent != null ){
		return this.parent.getTabCount() + 1;
	}
	return 0;
}

TXML.prototype.pushXMLAttribution = function( key, value ){
	if( value == null ) return;
	var str = value.toString();
	if( str=="" ) return;
	this.xml += " " + key + "=" + "\"" + value + "\"";
}


TXML.prototype.pushXML = function( str ){
	this.xml += str;
}

TXML.prototype.outputControlXML = function(){
	//trace( "{" + "name" + ":" + this.attributes["name"] + "}" );
	for( k in this.attributes ){
		this.pushXMLAttribution( k, this.attributes[k] );
	}
}

TXML.prototype.outputChildrenXML = function(){
	for each( c in this.children ){
		//trace( "child: " + c.getAttribute( UIControlAttribute.kName ) + " parent: " + c.parent.getAttribute( UIControlAttribute.kName ) );
		c.outputXML();
		//trace( "child2: " + c.getAttribute( UIControlAttribute.kName ) + " parent: " + c.parent.getAttribute( UIControlAttribute.kName ) );
	}
}

TXML.prototype.outputTabXML = function(){
	var n = this.getTabCount();
	for( var i = 0; i<n; ++i ){
		this.pushXML( "\t" );
	}
}

TXML.prototype.outputXML = function(){
	//trace( "{" + "name" + ":" + this.attributes["name"] + "}" );
	//this.xml = "";
	this.outputTabXML(); this.pushXML( "<" + this.nodeName ); this.outputControlXML(); this.pushXML( ">" );
	if( this.children.length > 0 ){
		this.pushXML( "\n" );
	}
	this.outputChildrenXML();
	if( this.children.length > 0 ){
		this.outputTabXML(); 
	}
	this.pushXML( "</" + this.nodeName + ">\n" );
	if( this.parent ){
		this.parent.pushXML( this.xml );
	}
	//trace( "{" + "name" + ":" + this.attributes["name"] + "}" );
	return this.xml;
}

UIXML = function(uiname){
	UIXML.superClass.call( this, "ui" );
	
	this.registerAttribute( "name", (uiname == null ? "uipanel" : uiname) );
}

UIXML.extend( TXML );
UIXML.prototype.init = function(){
	UIXML.superClass.prototype.init.call(this);

	this.registerAttribute( "version", "1.0" );
}

/////////////////////////////////////////////////////////////////////
/** ui主题的属性 */
SchemeAttribute = {};
/** 主题的名字, 如: iphone4, iphone5, ipad */
SchemeAttribute.kName = "name";
SchemeAttribute.kIsRetina = "is_retina";
SchemeAttribute.kScreenWidth = "screen_width";
SchemeAttribute.kScreenHeight= "screen_height";

/** 支持的控件类型 */
UIControlType = {};
UIControlType.kPanel = "panel";
UIControlType.kMovie = "movie Clip";
UIControlType.kImage = "image";
UIControlType.kImage9 = "image9";
UIControlType.kButton = "button";
UIControlType.kSlider = "slider";
UIControlType.kProgress = "progress";
UIControlType.kLabel = "label";
UIControlType.kLabelAtlas = "labelAtlas";
UIControlType.kRichText = "richText";
UIControlType.kCheckBox = "checkBox";
UIControlType.kEditBox = "editBox";
UIControlType.kArmature = "armature";
UIControlType.kAnim = "anim";
UIControlType.kParticle = "particle";
UIControlType.kNumbericStepper = "numStep";
UIControlType.kArmatureBtn = "armatureBtn";
UIControlType.kControlView = "controlView";
UIControlType.kToggleView = "toggleView";
UIControlType.kListView = "listView";
UIControlType.kPageView = "pageView";
UIControlType.kTableView = "tableView";
UIControlType.kScrollView = "scrollView";
UIControlType.kRelativeLayout = "relativeLayout";
/////////////////////////////////////////////////////////////////////
/** 控件的属性 */
UIControlAttribute = {};
/** 控件的唯一标志(以场景为单位) */
UIControlAttribute.kTag = "tag";
/** 控件的类型 */
UIControlAttribute.kType = "type";
/** 控件的文本 */
UIControlAttribute.kText = "text";
/** 控件文本尺寸 */
UIControlAttribute.kTextSize = "textSize";
/** 控件的名字,在程序中控制用 */
UIControlAttribute.kName = "name";
/** 是否可托动 */
UIControlAttribute.kEnableDrag = "enable_drag";
/** 用到的图片 */
UIControlAttribute.kImage = "image";
/** 9宫格方向 */
UIControlAttribute.kUp = "up";
UIControlAttribute.kDown = "down";
UIControlAttribute.kLeft = "left";
UIControlAttribute.kRight = "right";
/** 按钮的三个状态图 */
UIControlAttribute.kbtnImg_normal = "normal";
UIControlAttribute.kbtnImg_select = "select";
UIControlAttribute.kbtnImg_disable = "disable";
UIControlAttribute.kbtnImg_normal1 = "normal1";
UIControlAttribute.kbtnImg_select1 = "select1";
UIControlAttribute.kbtnImg_disable1 = "disable1";
UIControlAttribute.kbtnImg_normal2 = "normal2";
UIControlAttribute.kbtnImg_select2 = "select2";
UIControlAttribute.kbtnImg_disable2 = "disable2";
/** toggleView的排斥值 */
UIControlAttribute.kExclusion = "exclusion";
/** NumberStepper的两个按钮 */
UIControlAttribute.kbtn_lnormal = "lnormal";
UIControlAttribute.kbtn_lselect = "lselect";
UIControlAttribute.kbtn_ldisable = "ldisable";
UIControlAttribute.kbtn_rnormal = "rnormal";
UIControlAttribute.kbtn_rselect = "rselect";
UIControlAttribute.kbtn_rdisable = "rdisable";
UIControlAttribute.kstepbg = "stepBg";
/** 滑动条的三个图片 */
UIControlAttribute.ksliderImg_bg = "bg";
UIControlAttribute.ksliderImg_progress = "progress";
UIControlAttribute.ksliderImg_thumb = "thumb";
/** 骨骼动画的三个文件 */
UIControlAttribute.karmature_xml = "xml";
UIControlAttribute.kPng = "png";
UIControlAttribute.kPlist = "plist";
/** 摇杆的两个图片 */
UIControlAttribute.kcontrol_baseboard = "baseboard";
UIControlAttribute.kcontrol_joystick = "joystick";
/** 坐标 */
UIControlAttribute.kX = "x";
UIControlAttribute.kY = "y";
/** 图层决定zorder */
UIControlAttribute.kZ = "z";
/** 中心点坐标 */
UIControlAttribute.kOriginX = "ox";
UIControlAttribute.kOriginY = "oy";
/** 宽高 */
UIControlAttribute.kWidth = "width";
UIControlAttribute.kHeight = "height";
/** 缩放 */
UIControlAttribute.kScaleX = "scalex";
UIControlAttribute.kScaleY = "scaley";
/** 角度 */
UIControlAttribute.kAngle = "angle";
/**
 @brief 控件基类
 */
UIControl = function(){
	UIControl.superClass.call(this, XMLNode.control );
}

UIControl.extend( TXML );
UIControl.prototype.init = function(){
	for( k in UIControlAttribute ){
		this.registerAttribute( UIControlAttribute[k], "" );
	}
//	this.setNodeName( "control" );
}
/////////////////面板//////////////////////////////////////////////
UIPanel = function(){
	UIPanel.superClass.call(this);
}

UIPanel.extend( UIControl );
UIPanel.prototype.init = function(){
	UIPanel.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kPanel );
	//this.setAttribute( UIControlAttribute.kEnableDrag, 0 );
}
/////////////////////滑动条//////////////////////////////////////////
UISlider = function(){
	UISlider.superClass.call(this);
}
UISlider.extend( UIControl );
UISlider.prototype.init = function(){
	UISlider.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kSlider );
	//this.setAttribute( UIControlAttribute.kEnableDrag, 0 );
}
/////////////////////进度条//////////////////////////////////////////
UIProgress = function(){
	UIProgress.superClass.call(this);
}
UIProgress.extend( UIControl );
UIProgress.prototype.init = function(){
	UIProgress.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kProgress );
}
///////////////骨骼动画/////////////////////////////////////////////////
UIArmature = function(){
	UIArmature.superClass.call(this);
}
UIArmature.extend( UIControl );
UIArmature.prototype.init = function(){
	UIArmature.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kArmature );
}
/////////////逐帧动画/////////////////////////////////////////////////
UIAnim = function(){
	UIAnim.superClass.call(this);
}
UIAnim.extend( UIControl );
UIAnim.prototype.init = function(){
	UIAnim.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kAnim );
}
/////////////////////图片///////////////////////////////////////////
UIImage = function(){
	UIImage.superClass.call(this);
}
UIImage.extend( UIControl );
UIImage.prototype.init = function(){
	UIImage.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kImage );
}
/////////////////////9宫格图片///////////////////////////////////////////
UIImage9 = function(){
	UIImage9.superClass.call(this);
}
UIImage9.extend( UIControl );
UIImage9.prototype.init = function(){
	UIImage9.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kImage9 );
}
/////////////////////按钮/////////////////////////////////////////
UIButton = function(){
	UIButton.superClass.call(this);
}
UIButton.extend( UIControl );
UIButton.prototype.init = function(){
	UIButton.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kButton );
}
///////////////////checkBox///////////////////////////////////////////
UICheckBox = function(){
	UICheckBox.superClass.call(this);
}
UICheckBox.extend( UIControl );
UICheckBox.prototype.init = function(){
	UICheckBox.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kCheckBox );
}
///////////////////toggleView///////////////////////////////////////////
UIToggleView = function(){
	UIToggleView.superClass.call(this);
}
UIToggleView.extend( UIControl );
UIToggleView.prototype.init = function(){
	UIToggleView.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kToggleView );
}
///////////////////静态文本///////////////////////////////////////////
UILabel = function(){
	UILabel.superClass.call(this);
}
UILabel.extend( UIControl );
UILabel.prototype.init = function(){
	UILabel.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kLabel );
}
///////////////////数字文本///////////////////////////////////////////
UILabelAtlas = function(){
	UILabelAtlas.superClass.call(this);
}
UILabelAtlas.extend(UIControl);
UILabelAtlas.prototype.init = function(){
	UILabelAtlas.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kLabelAtlas );
}
///////////////////摇杆//////////////////////////////////////////////
UIControlView = function(){
	UIControlView.superClass.call(this);
}
UIControlView.extend( UIControl );
UIControlView.prototype.init = function(){
	UIControlView.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kControlView );
}
/////////////////ListView//////////////////////////////////////////////
UIListView = function(){
	UIListView.superClass.call(this);
}
UIListView.extend( UIControl );
UIListView.prototype.init = function(){
	UIListView.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kListView );
}
/////////////////PageView//////////////////////////////////////////////
UIPageView = function(){
	UIPageView.superClass.call(this);
}
UIPageView.extend( UIControl );
UIPageView.prototype.init = function(){
	UIPageView.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kPageView );
}
/////////////////ArmatureBtn//////////////////////////////////////////////
UIArmatureBtn = function(){
	UIArmatureBtn.superClass.call(this);
}
UIArmatureBtn.extend( UIControl );
UIArmatureBtn.prototype.init = function(){
	UIArmatureBtn.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kArmatureBtn );
}
/////////////////NumbericStepper//////////////////////////////////////////////
UINumbericStepper = function(){
	UINumbericStepper.superClass.call(this);
}
UINumbericStepper.extend( UIControl );
UINumbericStepper.prototype.init = function(){
	UINumbericStepper.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kNumbericStepper );
}
/////////////////ScrollView//////////////////////////////////////////////
UIScrollView = function(){
	UIScrollView.superClass.call(this);
}
UIScrollView.extend( UIControl );
UIScrollView.prototype.init = function(){
	UIScrollView.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kScrollView );
}
/////////////////TableView//////////////////////////////////////////////
UITableView = function(){
	UITableView.superClass.call(this);
}
UITableView.extend( UIControl );
UITableView.prototype.init = function(){
	UITableView.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kTableView );
}
/////////////////Particle//////////////////////////////////////////////
UIParticle = function(){
	UIParticle.superClass.call(this);
}
UIParticle.extend( UIControl );
UIParticle.prototype.init = function(){
	UIParticle.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kParticle );
}
/////////////////EditBox//////////////////////////////////////////////
UIEditBox = function(){
	UIEditBox.superClass.call(this);
}
UIEditBox.extend( UIControl );
UIEditBox.prototype.init = function(){
	UIEditBox.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kEditBox );
}
/////////////////RichText//////////////////////////////////////////////
UIRichText = function(){
	UIRichText.superClass.call(this);
}
UIRichText.extend( UIControl );
UIRichText.prototype.init = function(){
	UIRichText.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kRichText );
}
/////////////////RelativeLayout//////////////////////////////////////////////
UIRelativeLayout = function(){
	UIRelativeLayout.superClass.call(this);
}
UIRelativeLayout.extend( UIControl );
UIRelativeLayout.prototype.init = function(){
	UIRelativeLayout.superClass.prototype.init.call(this);
	this.setAttribute( UIControlAttribute.kType, UIControlType.kRelativeLayout );
}
/////////////////////////////////////////////////////////////////
kSchemeIPhone4 = "iphone4";
kSchemeIPhone5 = "iphone5";
kSchemeIPad = "ipad";
kScheme480x800 = "480x800";
kScheme640x960 = "640x960";

Scheme = function(){
	Scheme.superClass.call(this, XMLNode.scheme );
}

Scheme.extend( TXML );
Scheme.prototype.init = function(){
	Scheme.superClass.prototype.init.call(this);
	for( k in SchemeAttribute ){
		this.registerAttribute( SchemeAttribute[k], "" );
	}
//	this.setNodeName( "scheme" );
}

/** 横向 */
Scheme.prototype.setModeToLandscape = function(){
}

/** 纵向 */
Scheme.prototype.setModeToPortrait = function(){
}

SchemeIPhone4 = function(){
	SchemeIPhone4.superClass.call(this);
}
SchemeIPhone4.extend( Scheme );
SchemeIPhone4.prototype.init = function(){
	SchemeIPhone4.superClass.prototype.init.call(this);
	this.setAttribute( SchemeAttribute.kName, kSchemeIPhone4 );
	//this.setAttribute( SchemeAttribute.kIsRetina, 0 );
	this.setModeToPortrait();
}

/** 横向 */
SchemeIPhone4.prototype.setModeToLandscape = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 480);
	this.setAttribute( SchemeAttribute.kScreenHeight, 320);
}

/** 纵向 */
SchemeIPhone4.prototype.setModeToPortrait = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 320);
	this.setAttribute( SchemeAttribute.kScreenHeight, 480);
}

SchemeIPhone5 = function(){
	SchemeIPhone5.superClass.call(this);
}
SchemeIPhone5.extend( Scheme );
SchemeIPhone5.prototype.init = function(){
	SchemeIPhone5.superClass.prototype.init.call(this);
	this.setAttribute( SchemeAttribute.kName, kSchemeIPhone5 );
	//this.setAttribute( SchemeAttribute.kIsRetina, 0 );
	this.setModeToPortrait();
}

/** 横向 */
SchemeIPhone5.prototype.setModeToLandscape = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 568 );
	this.setAttribute( SchemeAttribute.kScreenHeight, 320 );
}

/** 纵向 */
SchemeIPhone5.prototype.setModeToPortrait = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 320 );
	this.setAttribute( SchemeAttribute.kScreenHeight, 568 );
}

SchemeIPad = function(){
	SchemeIPad.superClass.call(this);
}
SchemeIPad.extend( Scheme );
SchemeIPad.prototype.init = function(){
	SchemeIPad.superClass.prototype.init.call(this);
	this.setAttribute( SchemeAttribute.kName, kSchemeIPad );
	//this.setAttribute( SchemeAttribute.kIsRetina, 0 );
	this.setModeToLandscape();
}

/** 横向 */
SchemeIPad.prototype.setModeToLandscape = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 1024);
	this.setAttribute( SchemeAttribute.kScreenHeight, 768);
}

/** 纵向 */
SchemeIPad.prototype.setModeToPortrait = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 768);
	this.setAttribute( SchemeAttribute.kScreenHeight, 1024);
}

Scheme480x800 = function(){
	Scheme480x800.superClass.call(this);
}
Scheme480x800.extend( Scheme );
Scheme480x800.prototype.init = function(){
	Scheme480x800.superClass.prototype.init.call(this);
	this.setAttribute( SchemeAttribute.kName, kScheme480x800 );
	//this.setAttribute( SchemeAttribute.kIsRetina, 0 );
	this.setModeToLandscape();
}

/** 横向 */
Scheme480x800.prototype.setModeToLandscape = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 800 );
	this.setAttribute( SchemeAttribute.kScreenHeight, 480 );
}

/** 纵向 */
Scheme480x800.prototype.setModeToPortrait = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 480 );
	this.setAttribute( SchemeAttribute.kScreenHeight, 800 );
}

Scheme640x960 = function(){
	Scheme640x960.superClass.call(this);
}
Scheme640x960.extend( Scheme );
Scheme640x960.prototype.init = function(){
	Scheme640x960.superClass.prototype.init.call(this);
	this.setAttribute( SchemeAttribute.kName, kScheme640x960 );
	//this.setAttribute( SchemeAttribute.kIsRetina, 0 );
	this.setModeToLandscape();
}

/** 横向 */
Scheme640x960.prototype.setModeToLandscape = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 960 );
	this.setAttribute( SchemeAttribute.kScreenHeight, 640 );
}

/** 纵向 */
Scheme640x960.prototype.setModeToPortrait = function(){
	this.setAttribute( SchemeAttribute.kScreenWidth, 640 );
	this.setAttribute( SchemeAttribute.kScreenHeight, 960 );
}

/////////////////////////////////////////////////////////////////////
ExportUITool = function(){
	this.xml = null;
}

/** 导出UI数据 */
ExportUITool.prototype.exportUIXML = function( doc ){
	if( !doc ){
		alert( ExportElementXMLErrorStrings.kNullDocument );
		return null;
	}

	//取得时间轴,遍历图层
	var timeline = doc.getTimeline();
	var layerindex = 0;
	for each( layer in timeline ){
		this.exportLayer( layer, layerindex++ );
	}
	//trace( this.xml );
	//trace( this.xml.outputXML() );
}

/** 导出一个图层的数据 */
ExportUITool.prototype.exportLayer = function( layer, layerIndex ){
	var frameindex = 0;
	for each( frame in layer ){
		this.exportFrame( frame, frameindex++ );
	}
}

/** 导出一帧的数据 */
ExportUITool.prototype.exportFrame = function( frame, frameIndex ){
	var elementindex = 0;
	for each( element in frame ){
		this.exportElement( element, elementindex );
	}
}

/** 导出一帧的元素 */
ExportUITool.prototype.exportElement = function( element ){
	//判断是什么类型的元素，导出相应元素	
}

/** 导出一个MovieClip的数据 */
ExportUITool.prototype.exprotMovieClip = function( mc ){

}

/////////////////////////////////////////////////////////////////////
/** 
 @brief 把fla文件转换为xml
 */
kExportLayerCurrent = 0; //导出当前层
kExportLayerVisible = 1; //导出可见层
kExportLayerAll = 2;	 //导出所有层

FlaToXML = function(){
	/** TXML,保存xml */
	this.txml = null;
	/** 当前处理的fla文件, Document Object */
	this.obj_fla = null;
	/** TH,保存文件 */
	this.th = null;
	
	/** 导出哪些层,默认为导出所有层 */
	this.export_layer_type = kExportLayerAll;
	
	this.init();
}

FlaToXML.prototype.init = function(){
}
FlaToXML.prototype.cid = 1;//组件id
/**
 @brief 设置导出哪些层
 @param v{ kExportLayerCurrent, kExportLayerVisible, kExportLayerAll }
 */
FlaToXML.prototype.setExportLayerType = function( v ){
	this.export_layer_type = v;
}

FlaToXML.prototype.isExportLayerCurrent = function(){
	return this.export_layer_type == kExportLayerCurrent;
}

FlaToXML.prototype.isExportLayerVisible = function(){
	return this.export_layer_type == kExportLayerVisible;
}

FlaToXML.prototype.isExportLayerAll = function(){
	return this.export_layer_type == kExportLayerAll;
}

/** 判断element是否为movie clip */
FlaToXML.prototype.elementIsMc = function( element ){
	if(element.libraryItem == null) return false;
	var type = element.libraryItem.itemType;
	if( "movie clip" == type ) return true;
	if( "graphic" == type ) return true;
	return false;
}

/** 判断element是否为label */
FlaToXML.prototype.elementIsText = function(element){
	return (element.elementType == "text");
}

/** 获取element的xml类型 */
FlaToXML.prototype.getElementUIType = function( element ){
	if( this.elementIsMc( element ) ) return UIControlType.kMovie;
	if( this.elementIsButton( element ) ) return UIControlType.kButton;
	return "undefined";
}

/** 
 @brief 把objfla:Document Object转换为xmlfile:string xml文件 
 @param objfla:Document Object
 @param xmlfile:string 目标文件名
 @param uiname:string UI名字
 @param scheme:Scheme 布局类型new SchemeIPone4(), new SchemeIPhone5()等等
 */
FlaToXML.prototype.convert = function( objfla, xmlfile, uiname, scheme ){
	if( objfla == null ){
		alert( ExportElementXMLErrorStrings.kNoOpenedFla );
	}
	if( scheme == null ){
		alert( ExportElementXMLErrorStrings.kNoSetScheme );
	}

	this.obj_fla = objfla;
	this.txml = new UIXML( uiname );
	this.txml.addChild( scheme );
	
	this.th = new TH();
	
	if( xmlfile == "" || xmlfile == null ){
		xmlfile = objfla.name.split(".")[0] + ".xml";
	}
	
	var flaname = this.obj_fla.name;
	trace( "FlaToXML: 开始转换fla[" + flaname + "]文件为xml:[" + xmlfile + "] ui文件" );
	
	if( this.isExportLayerCurrent() ){
		//导出当前层
		var timeline = objfla.getTimeline();
		if( timeline.currentLayer < 0 || timeline.currentLayer == undefined ){
			//alert( "当前没有选中的图层!" );
			return;
		}
		var current_layer_index = timeline.currentLayer;
		trace( "当前选中的是第" + timeline.currentLayer + "层" );
		var layer = timeline.layers[current_layer_index];
		this.fetchElementFromLayer( layer, current_layer_index, this.txml );

	}else if( this.isExportLayerVisible() ){
		//导出可见层
		var nlayer = objfla.getTimeline().layerCount;
		for( var layer_index = nlayer-1; layer_index >= 0; --layer_index ){
			var layer = objfla.getTimeline().layers[layer_index];
			if( layer.visible ){
				this.fetchElementFromLayer( layer, layer_index, this.txml );
			}
		}
		
	}else{
		//导出全部
		this.fetchElement( objfla.getTimeline(), this.txml );		
	}
	this.outputXML();
}

/** 转换元素为UICnotrol */
FlaToXML.prototype.convertElement = function( element , elementIndex){
	var e_xml = null;
	if( this.elementIsMc( element ) ){
		e_xml = this.convertMC( element ,elementIndex);
	}else if( this.elementIsText( element )){
		e_xml = this.convertText( element,elementIndex);
	}else{
		alert( "未知的类型: " + element.instanceType + " " + element.libraryItem.itemType );
	}
	return e_xml;
}

/** 填充一般属性 */
FlaToXML.prototype.fullNormalAttirbute = function( xml, element ,elementIndex){	
	xml.setAttribute( UIControlAttribute.kX, formatNumber( element.x ) );
	xml.setAttribute( UIControlAttribute.kY, formatNumber( element.y ) );
	
	var ox = element.x - element.left;
	var oy = element.y - element.top;
	xml.setAttribute( UIControlAttribute.kOriginX, formatNumber(ox) );
	xml.setAttribute( UIControlAttribute.kOriginY, formatNumber(oy) );
	
	xml.setAttribute( UIControlAttribute.kWidth, formatNumber(element.width) );
	xml.setAttribute( UIControlAttribute.kHeight, formatNumber(element.height) );
	xml.setAttribute( UIControlAttribute.kTag, formatNumber(elementIndex));
}

/** 转换movie clip */
FlaToXML.prototype.convertMC = function( mc , elementIndex){
	var control_xml = null;
	switch(mc.name.split("_")[0]){//获取mc的类型
		
		case "panel":
			control_xml = this.convertPanel(mc,elementIndex);
			break;
		case "relLayer":
			control_xml = this.convertRelativeLayout(mc,elementIndex);
			break;	
		case "img":
			control_xml = this.convertImg(mc,elementIndex);
			break;
		case "img9":
			control_xml = this.convertImg9(mc,elementIndex);
			break;
		case "ckb":
			control_xml = this.convertCheckBox(mc,elementIndex);
			break;
		case "slider":
			control_xml = this.convertSlider(mc,elementIndex);
			break;
		case "prog":
			control_xml = this.converProgress(mc,elementIndex);
			break;
		case "armature":
			control_xml = this.convertArmature(mc,elementIndex);
			break;
		case "anim":
			control_xml = this.convertAnim(mc,elementIndex);
			break;
		case "ctlv":
			control_xml = this.convertControlView(mc,elementIndex);
			break;
		case "tgv":
			control_xml = this.convertToggleView(mc,elementIndex);
			break;
		case "list":
			control_xml = this.convertListView(mc,elementIndex);
			break;
		case "page":
			control_xml = this.convertPageView(mc,elementIndex);
			break;
		case "scrol":
			control_xml = this.convertScrollView(mc,elementIndex);
			break;
		case "labAtlas":
			control_xml = this.convertLabAtlas(mc,elementIndex);
			break;
		case "armBtn":
			control_xml = this.convertArmatureBtn(mc,elementIndex);
			break;
		case "btn":
			control_xml = this.convertButton(mc,elementIndex);
			break;
		case "numStep":
			control_xml = this.convertNumberStepper(mc,elementIndex);
			break;
		case "ptl":
			control_xml = this.convertParticle(mc,elementIndex);
			break;
		case "table":
			control_xml = this.convertTableView(mc,elementIndex);
			break;
		case "edit":
			control_xml = this.convertEditBox(mc,elementIndex);
			break;
		case "rtf":
			control_xml = this.convertRichText(mc,elementIndex);
			break;
	}
	return control_xml;
}

/** 转换panel */
FlaToXML.prototype.convertPanel = function(panel,elementIndex){
	var control_xml = new UIPanel();
	control_xml.setAttribute( UIControlAttribute.kName, panel.name );
	this.fullNormalAttirbute( control_xml, panel, elementIndex );
	//获取mc的timeline
	var timeline = panel.libraryItem.timeline;
	this.fetchElement( timeline, control_xml );
	
	this.th.obj[panel.name] = elementIndex;
	return control_xml;
}
/** 转换convertRelativeLayout */
FlaToXML.prototype.convertRelativeLayout = function(relativeLayout,elementIndex){
	var xml_relativeLayout = new UIRelativeLayout();
	xml_relativeLayout.setAttribute( UIControlAttribute.kName, relativeLayout.name );
	this.fullNormalAttirbute( xml_relativeLayout, relativeLayout ,elementIndex );
	//获取mc的timeline
	var timeline = relativeLayout.libraryItem.timeline;
	this.fetchElement( timeline, xml_relativeLayout );
	
	this.th.obj[relativeLayout.name] = elementIndex;
	return xml_relativeLayout;
}
/** 转换image */
FlaToXML.prototype.convertImg = function( image , elementIndex){
	var xml_img = new UIImage();
	xml_img.setAttribute( UIControlAttribute.kImage, image.libraryItem.name + ".png" );
	xml_img.setAttribute( UIControlAttribute.kName, image.name );
	this.fullNormalAttirbute( xml_img, image ,elementIndex );
	
	this.th.obj[image.name] = elementIndex;
	return xml_img;
}
/** 转换image9 */
FlaToXML.prototype.convertImg9 = function( image9 , elementIndex){
	var xml_img9 = new UIImage9();
	var nameArr = image9.name.split("_");		//img9_test_10_10_10_10
	var imgName = nameArr[0]+"_"+nameArr[1];
	xml_img9.setAttribute( UIControlAttribute.kUp,nameArr[2]);
	xml_img9.setAttribute( UIControlAttribute.kDown,nameArr[3]);
	xml_img9.setAttribute( UIControlAttribute.kLeft,nameArr[4]);
	xml_img9.setAttribute( UIControlAttribute.kRight,nameArr[5]);
	xml_img9.setAttribute( UIControlAttribute.kImage, image9.libraryItem.name + ".png" );
	xml_img9.setAttribute( UIControlAttribute.kName, imgName );
	this.fullNormalAttirbute( xml_img9, image9 ,elementIndex );
	
	this.th.obj[imgName] = elementIndex;
	return xml_img9;
}
/** 转换anim */
FlaToXML.prototype.convertAnim = function(anim ,elementIndex){
	var xml_anim = new UIAnim();
	xml_anim.setAttribute( UIControlAttribute.kName, anim.name );
	xml_anim.setAttribute(UIControlAttribute.kPlist,anim.libraryItem.name + ".plist");
	xml_anim.setAttribute(UIControlAttribute.kPng,anim.libraryItem.name + ".png");
	this.fullNormalAttirbute( xml_anim, anim ,elementIndex );
	
	this.th.obj[anim.name] = elementIndex;
	return xml_anim;
}
/** 转换button */
FlaToXML.prototype.convertButton = function( button ,elementIndex){
	var xml_btn = new UIButton();
	xml_btn.setAttribute( UIControlAttribute.kName, button.name );
	
	this.fullNormalAttirbute( xml_btn, button ,elementIndex );
	xml_btn.setAttribute( UIControlAttribute.kbtnImg_normal, button.libraryItem.name + "_normal.png" );
	xml_btn.setAttribute( UIControlAttribute.kbtnImg_select, button.libraryItem.name + "_select.png" );
	xml_btn.setAttribute( UIControlAttribute.kbtnImg_disable, button.libraryItem.name + "_disable.png" );
	this.th.obj[button.name] = elementIndex;
	return xml_btn;
}
/** 转换checkBox */
FlaToXML.prototype.convertCheckBox = function(checkBox,elementIndex){
	var xml_checkBox = new UICheckBox();
	xml_checkBox.setAttribute( UIControlAttribute.kName, checkBox.name );
	this.fullNormalAttirbute( xml_checkBox, checkBox ,elementIndex );
	xml_checkBox.setAttribute( UIControlAttribute.kbtnImg_normal1, checkBox.libraryItem.name + "_normal1.png" );
	xml_checkBox.setAttribute( UIControlAttribute.kbtnImg_normal2, checkBox.libraryItem.name + "_normal2.png" );
	xml_checkBox.setAttribute( UIControlAttribute.kbtnImg_select1, checkBox.libraryItem.name + "_select1.png" );
	xml_checkBox.setAttribute( UIControlAttribute.kbtnImg_select2, checkBox.libraryItem.name + "_select2.png" );
	xml_checkBox.setAttribute( UIControlAttribute.kbtnImg_disable1, checkBox.libraryItem.name + "_disable1.png" );
	xml_checkBox.setAttribute( UIControlAttribute.kbtnImg_disable2, checkBox.libraryItem.name + "_disable2.png" );
	this.th.obj[checkBox.name] = elementIndex;
	return xml_checkBox;
}
/** 转换slider */
FlaToXML.prototype.convertSlider = function(slider,elementIndex){
	var xml_slider = new UISlider();
	xml_slider.setAttribute( UIControlAttribute.kName, slider.name );
	this.fullNormalAttirbute( xml_slider, slider ,elementIndex );
	
	xml_slider.setAttribute(UIControlAttribute.ksliderImg_bg,slider.libraryItem.name + "_bg.png");
	xml_slider.setAttribute(UIControlAttribute.ksliderImg_progress,slider.libraryItem.name + "_progress.png");
	xml_slider.setAttribute(UIControlAttribute.ksliderImg_thumb,slider.libraryItem.name + "_thumb.png");
	this.th.obj[slider.name] = elementIndex;
	return xml_slider;
}
/** 转换progress */
FlaToXML.prototype.converProgress = function(prog,elementIndex){
	var xml_prog = new UIProgress();
	xml_prog.setAttribute( UIControlAttribute.kName, prog.name );
	this.fullNormalAttirbute( xml_prog, prog ,elementIndex );
	
	xml_prog.setAttribute(UIControlAttribute.ksliderImg_bg,prog.libraryItem.name + "_bg.png");
	xml_prog.setAttribute(UIControlAttribute.ksliderImg_progress,prog.libraryItem.name + "_progress.png");
	this.th.obj[prog.name] = elementIndex;
	return xml_prog;
}
/** 转换armature */
FlaToXML.prototype.convertArmature = function(armature,elementIndex){
	var xml_armature = new UIArmature();
	xml_armature.setAttribute( UIControlAttribute.kName, armature.name );
	this.fullNormalAttirbute( xml_armature, armature ,elementIndex );
	
	xml_armature.setAttribute(UIControlAttribute.karmature_xml,armature.libraryItem.name + ".xml");
	xml_armature.setAttribute(UIControlAttribute.kPng,armature.libraryItem.name + ".png");
	xml_armature.setAttribute(UIControlAttribute.kPlist,armature.libraryItem.name + ".plist");
	this.th.obj[armature.name] = elementIndex;
	return xml_armature;
}
/** 转换label */
FlaToXML.prototype.convertText = function(label,elementIndex){
	var xml_label = new UILabel();
	xml_label.setAttribute( UIControlAttribute.kName, label.name );
	this.fullNormalAttirbute( xml_label, label ,elementIndex );
	//for(var k in label.textRuns[0].textAttrs){
	//	trace("k: "+k + " "+label.textRuns[0].textAttrs[k]);
	//}
	var text = "";
	for(var j=0; j<label.textRuns.length; j++){
		var item = label.textRuns[j];
		for(var i=0; i<item.characters.length; i++){
			text += item.characters[i];
		}
	}
	//trace("label text:"+label.textRuns[0].characters);
	xml_label.setAttribute(UIControlAttribute.kText,text);
	xml_label.setAttribute(UIControlAttribute.kTextSize,label.textRuns[0].textAttrs.size);
	this.th.obj[label.name] = elementIndex;
	return xml_label;
}
/** 转换LabelAtlas */
FlaToXML.prototype.convertLabAtlas = function(labAtlas,elementIndex){
	var xml_labAtlas = new UILabelAtlas();
	xml_labAtlas.setAttribute(UIControlAttribute.kName,labAtlas.name);
	this.fullNormalAttirbute( xml_labAtlas, labAtlas ,elementIndex );
	var imgPath = labAtlas.libraryItem.name + ".png";
	xml_labAtlas.setAttribute( UIControlAttribute.kImage, imgPath );
	this.th.obj[labAtlas.name] = elementIndex;
	return xml_labAtlas;
}
/** 转换controlView */
FlaToXML.prototype.convertControlView = function(control,elementIndex){
	var xml_control = new UIControlView();
	xml_control.setAttribute( UIControlAttribute.kName, control.name );
	this.fullNormalAttirbute( xml_control, control ,elementIndex );
	xml_control.setAttribute(UIControlAttribute.kcontrol_baseboard,control.libraryItem.name + "_baseboard.png");
	xml_control.setAttribute(UIControlAttribute.kcontrol_joystick,control.libraryItem.name + "_joystick.png");
	this.th.obj[control.name] = elementIndex;
	return xml_control;
}
/** 转换toggleView */
FlaToXML.prototype.convertToggleView = function(toggleView,elementIndex){
	var xml_toggleView = new UIToggleView();
	var nameArr = toggleView.name.split("_");//tgv_test_1
	var exclusionId = nameArr.pop();
	var viewName = nameArr.join("_");
	xml_toggleView.setAttribute(UIControlAttribute.kName,viewName);
	xml_toggleView.setAttribute(UIControlAttribute.kExclusion,exclusionId);
	this.fullNormalAttirbute( xml_toggleView, toggleView ,elementIndex );
	xml_toggleView.setAttribute( UIControlAttribute.kbtnImg_normal, toggleView.libraryItem.name + "_normal.png" );
	xml_toggleView.setAttribute( UIControlAttribute.kbtnImg_select, toggleView.libraryItem.name + "_select.png" );
	xml_toggleView.setAttribute( UIControlAttribute.kbtnImg_disable, toggleView.libraryItem.name + "_disable.png" );
	this.th.obj[viewName] = elementIndex;
	return xml_toggleView;
}
/** 转换listView */
FlaToXML.prototype.convertListView = function(listView,elementIndex){
	var xml_toggleView = new UIListView();
	xml_toggleView.setAttribute( UIControlAttribute.kName, listView.name );
	this.fullNormalAttirbute( xml_toggleView, listView ,elementIndex );
	xml_toggleView.setAttribute(UIControlAttribute.kImage,listView.libraryItem.name + ".png");
	this.th.obj[listView.name] = elementIndex;
	return xml_toggleView;
}
/** 转换pageView  */
FlaToXML.prototype.convertPageView = function(pageView,elementIndex){
	var xml_pageView = new UIPageView();
	xml_pageView.setAttribute( UIControlAttribute.kName, pageView.name );
	this.fullNormalAttirbute( xml_pageView, pageView ,elementIndex );
	this.th.obj[pageView.name] = elementIndex;
	return xml_pageView;
}
/** 转换armatureBtn */
FlaToXML.prototype.convertArmatureBtn = function(armatureBtn,elementIndex){
	var xml_armatureBtn = new UIArmatureBtn();
	xml_armatureBtn.setAttribute( UIControlAttribute.kName, armatureBtn.name );
	this.fullNormalAttirbute( xml_armatureBtn, armatureBtn ,elementIndex );
	xml_armatureBtn.setAttribute(UIControlAttribute.karmature_xml,armatureBtn.libraryItem.name + ".xml");
	xml_armatureBtn.setAttribute(UIControlAttribute.kPng,armatureBtn.libraryItem.name + ".png");
	xml_armatureBtn.setAttribute(UIControlAttribute.kPlist,armatureBtn.libraryItem.name + ".plist");
	this.th.obj[armatureBtn.name] = elementIndex;
	return xml_armatureBtn;
}
/** 转换numberStepper */
FlaToXML.prototype.convertNumberStepper = function(numStep,elementIndex){
	var xml_numStep = new UINumbericStepper();
	xml_numStep.setAttribute( UIControlAttribute.kName, numStep.name );
	this.fullNormalAttirbute( xml_numStep, numStep ,elementIndex );
	xml_numStep.setAttribute(UIControlAttribute.kbtn_lnormal,numStep.libraryItem.name + "_lnomal.png");
	xml_numStep.setAttribute(UIControlAttribute.kbtn_lselect,numStep.libraryItem.name + "_lselect.png");
	xml_numStep.setAttribute(UIControlAttribute.kbtn_ldisable,numStep.libraryItem.name + "_ldisable.png");
	xml_numStep.setAttribute(UIControlAttribute.kbtn_rnormal,numStep.libraryItem.name + "_rnomal.png");
	xml_numStep.setAttribute(UIControlAttribute.kbtn_rselect,numStep.libraryItem.name + "_rselect.png");
	xml_numStep.setAttribute(UIControlAttribute.kbtn_rdisable,numStep.libraryItem.name + "_rdisable.png");
	xml_numStep.setAttribute(UIControlAttribute.kstepbg,numStep.libraryItem.name + "_stepbg.png");
	
	this.th.obj[numStep.name] = elementIndex;
	return xml_numStep;
}
/** 转换scrollView */
FlaToXML.prototype.convertScrollView = function(scrollView,elementIndex){
	var xml_scrollView = new UIScrollView();
	xml_scrollView.setAttribute( UIControlAttribute.kName, scrollView.name );
	this.fullNormalAttirbute( xml_scrollView, scrollView ,elementIndex );
	this.th.obj[scrollView.name] = elementIndex;
	return xml_scrollView;
}
/** 转换粒子 */
FlaToXML.prototype.convertParticle = function(particle,elementIndex){
	var xml_particle = new UIParticle();
	xml_particle.setAttribute( UIControlAttribute.kName, particle.name );
	xml_particle.setAttribute(UIControlAttribute.kPlist,particle.libraryItem.name + ".plist");
	this.fullNormalAttirbute( xml_particle, particle ,elementIndex );
	this.th.obj[particle.name] = elementIndex;
	return xml_particle;
}
/** 转换table */
FlaToXML.prototype.convertTableView = function(table,elementIndex){
	var xml_tableView = new UITableView();
	xml_tableView.setAttribute( UIControlAttribute.kName, table.name );
	this.fullNormalAttirbute( xml_tableView, table ,elementIndex );
	this.th.obj[table.name] = elementIndex;
	return xml_tableView;
}
/** 转换EditBox */
FlaToXML.prototype.convertEditBox = function(editBox,elementIndex){
	var xml_editBox = new UIEditBox();
	xml_editBox.setAttribute( UIControlAttribute.kImage, editBox.libraryItem.name + ".png" );
	xml_editBox.setAttribute( UIControlAttribute.kName, editBox.name );
	this.fullNormalAttirbute( xml_editBox, editBox ,elementIndex );
	this.th.obj[editBox.name] = elementIndex;
	return xml_editBox;
}
/** 转换RichText */
FlaToXML.prototype.convertRichText = function(richText,elementIndex){
	var xml_richText = new UIRichText();
	xml_richText.setAttribute( UIControlAttribute.kName, richText.name );
	this.fullNormalAttirbute( xml_richText, richText ,elementIndex );
	this.th.obj[richText.name] = elementIndex;
	return xml_richText;
}

/**
 @brief 从某个layer里提取元素
 */
FlaToXML.prototype.fetchElementFromLayer = function( layer, layer_index, parentxml ){
	var nframe = layer.frameCount;
	
	for( var frame_index = 0; frame_index < nframe; ++frame_index ){
		var frame = layer.frames[frame_index];
			
		var nelement = frame.elements.length;
		for( var element_index = 0; element_index < nelement; ++element_index ){
			
			var element = frame.elements[element_index];
			//trace("--->  "+element_index+"  "+element);
			//trace( "第" + layer_index + "层" + layer.name + ",第" + frame_index + "帧,第" + element_index + "个元素是:" + element.name
			//		  + "类型[" + element.libraryItem.itemType + "]将被转换成"
			//		  + this.getElementUIType( element ) + "实例名" + element.libraryItem.name );
			var exml = this.convertElement( element ,this.cid++);
			parentxml.addChild( exml );
		}
	}
}

/**
 @brief 从timeline里提取element,并填加到父节点 
 @param parentxml:TXML 父节点
 */
FlaToXML.prototype.fetchElement = function( timeline, parentxml ){
	//trace( "FlaToXML: 提取fla里的元素" );
	//获取时间轴
	//var time_line = this.obj_fla.getTimeline();
	var time_line = timeline;
	var nlayer = time_line.layerCount;
//	for( var layer_index = 0; layer_index < nlayer; ++layer_index ){
	for( var layer_index = nlayer-1; layer_index >= 0; --layer_index ){
		var layer = time_line.layers[layer_index];

		var nframe = layer.frameCount;
		
		for( var frame_index = 0; frame_index < nframe; ++frame_index ){
			var frame = layer.frames[frame_index];
			
			var nelement = frame.elements.length;
			for( var element_index = 0; element_index < nelement; ++element_index ){
				var element = frame.elements[element_index];
				trace( "第" + layer_index + "层" + layer.name + ",第" + frame_index + "帧,第" + element_index + "个元素是:" + element.name);
				//	  + "类型[" + element.libraryItem.itemType + "]将被转换成"
				//	  + this.getElementUIType( element ) + "实例名" + element.libraryItem.name );
				//trace( "类型是:[" + element.libraryItem.itemType +"]将被转换成" + this.getElementUIType( element ) );
				//trace( "实例名:" + element.libraryItem.name );
				var exml = this.convertElement( element ,this.cid++ );
				parentxml.addChild( exml );
			}
		}
	}
}

FlaToXML.prototype.outputXML = function(){
	//trace( "FlaToXML: 输出xml文件" );
	this.txml.outputXML();
	//trace( this.txml.xml );
}

/**
 @brief 通过名字得到主题
 @param schemename:string 主题名
 */
getSupportScheme = function( schemename ){
	var scheme = null;
	if( schemename == kSchemeIPhone4 ){
		scheme = new SchemeIPhone4();
	}else if( schemename == kSchemeIPhone5 ){
		scheme = new SchemeIPhone5();
	}else if( schemename == kSchemeIPad ){
		scheme = new SchemeIPad();
	}else if( schemename == kScheme480x800 ){
		scheme = new Scheme480x800();
	}else if( schemename = kScheme640x960 ){
		scheme = new Scheme640x960();
	}else{
		alert( "未设定主题" );
		return null;
	}
	return scheme;
}

/**
 @brief 导出当前打开的fla文件xml
 @param uiname:string uiname
 @param schemename:string 主题名
 @param isportrait:bool 是否竖屏
 */
export_current_layer = function( uiname, schemename, isportrait ){
	var scheme = getSupportScheme( schemename );
	if( isportrait == "1" ){
		scheme.setModeToPortrait();
	}else{
		scheme.setModeToLandscape();
	}

	var convert = new FlaToXML();
	convert.setExportLayerType( kExportLayerCurrent );
	convert.convert( fl.getDocumentDOM(), null, uiname, scheme );
	return convert;
}

/**
 @brief 导出所有可见的图层
 @param uiname:string uiname
 @param schemename:string 主题名
 */
export_visible_layer = function( uiname, schemename, isportrait ){
	var scheme = getSupportScheme( schemename );
	
	if( isportrait == "1" ){
		scheme.setModeToPortrait();
	}else{
		scheme.setModeToLandscape();
	}
	
	var convert = new FlaToXML();
	convert.setExportLayerType( kExportLayerVisible );
	convert.convert( fl.getDocumentDOM(), null, uiname, scheme );
	return convert.txml.xml;
}

/**
 @brief 导出所有图层
 @param uiname:string uiname
 @param schemename:string 主题名
 */
export_all_layer = function( uiname, schemename, isportrait ){
	var scheme = getSupportScheme( schemename );
	if( null == scheme ) return ("unknown scheme: " + schemename);

	if( isportrait == "1" ){
		scheme.setModeToPortrait();
	}else{
		scheme.setModeToLandscape();
	}
	var convert = new FlaToXML();
	convert.setExportLayerType( kExportLayerAll );
	convert.convert( fl.getDocumentDOM(), null, uiname, scheme );
	return convert.txml.xml;
}

cls();
var tui = export_current_layer( "myUI", kScheme480x800 , "0" );//xml名字，分辨率，横纵方向
var hcontent = tui.th.parseContent();
var saveXmlPath = "file:///F|/WorkSpace/C++WorkSpace/cocos2d-x-2.2.1/projects/AttackAlian/Resources/tui/480x800.xml";//保存xml的路径
var saveHPath = "file:///F|/WorkSpace/C++WorkSpace/cocos2d-x-2.2.1/projects/AttackAlian/Classes/tui/tuiTagMap.h";//保存h的路径
FLfile.write(saveXmlPath,tui.txml.xml);
FLfile.write(saveHPath,hcontent);
trace(tui.txml.xml);
trace(hcontent);
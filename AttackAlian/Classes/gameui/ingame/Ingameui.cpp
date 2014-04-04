#include "Ingameui.h"

Ingameui::Ingameui()
:m_speed(0.75f)
,m_curLevel(1)
{
}
//�첽���ش���Դ
void Ingameui::onLoadResources(){
	addImageAsync("res_iphone/ingame/img_bgingame1.png");
	addImageAsync("res_iphone/ingame/armature_hero.png");
}

void Ingameui::onLoadScene(){

	setAutoRemoveUnusedTexture(true);
	TuiManager::sharedManager()->parseScene(this,"panel_ingame");
	CCMsgManager::sharedManager()->registerMsgDelegate(this);
	((CWidgetWindow*)getPanel(PANEL_INGAME_UI))->setMultiTouchEnabled(true);//��������
	//ע�ᰴť�¼�
	CButton* pBtnFire = (CButton*) this->getControl(PANEL_INGAME_UI,BTN_FIRE);
	pBtnFire->setOnClickListener(this,ccw_click_selector(Ingameui::event_btn_fire));
	CButton* pBtnTool = (CButton*) this->getControl(PANEL_INGAME_UI_TOOL,BTN_TOOL);
	pBtnTool->setOnClickListener(this,ccw_click_selector(Ingameui::event_btn_tool));
	//ע���ֱ��¼�
	CControlView* pControlView = (CControlView*) this->getControl(PANEL_INGAME_UI,CTLV_LEFT);
	pControlView->setOnControlListener(this, ccw_control_selector(Ingameui::event_on_move));
	//��ʼ����Ϸ������
	CSlider* pGameSlider = (CSlider*) this->getControl(PANEL_INGAME_UI_TOOL,SLIDER_GAME);
	pGameSlider->setEnabled(false);

	m_pHero = Hero::create();
	m_pHero->setArmature((CCArmature*)this->getControl(PANEL_INGAME,ARMATURE_HERO));
	m_pHero->createHpSlider(getPanel(PANEL_INGAME));
	m_pHero->retain();
	//����manager
	m_ingameAnim = IngameAnimTask::create();
	m_ingameAnim->retain();
	m_commAnim = CommonAnimTask::create();
	m_commAnim->retain();
	m_monstorManager = MonstorMgr::create();
	m_monstorManager->retain();
	m_levelManager = LevelMgr::create();
	m_levelManager->retain();

	m_arrWeapon = DataProxy::sharedManager()->getArrWeapon();//��ȡװ��
	m_arrWeapon->retain();
	m_arrMedicine = DataProxy::sharedManager()->getArrMedicine();//��ȡҩˮ
	m_arrMedicine->retain();
	m_arrProp = DataProxy::sharedManager()->getArrProp();//��ȡװ��
	m_arrProp->retain();
	m_curLevel = DataProxy::sharedManager()->getLevel();//��ȡ�ؿ�

	m_commAnim->addChildInTool(m_arrWeapon,m_arrMedicine,m_arrProp,getPanel(PANEL_INGAME_UI_TOOL),
		getControl(PANEL_INGAME_UI_TOOL,IMG_INGAME_P_TOOL1)->getPosition(),
		getControl(PANEL_INGAME_UI_TOOL,IMG_INGAME_P_TOOL5)->getPosition(),
		getControl(PANEL_INGAME_UI_TOOL,IMG_INGAME_P_TOOL9)->getPosition());

	m_levelManager->startGame(getPanel(PANEL_INGAME),m_monstorManager,m_pHero,m_arrWeapon,m_curLevel);//��ʼ��Ϸ
	//����ˢ��
	scheduleUpdate();
}

void Ingameui::update(float delta){
	//�������Boss�Ƿ��ܹ�����Ӣ��
	m_monstorManager->checkHurtHero(m_pHero);
	if(!m_pHero->isLive()){//Ӣ�������� ��������ҽԺ
		m_monstorManager->walkToEntrance(this->getControl(PANEL_INGAME,IMG_INGAME_P_ENTERPLACE));
	}
}

void Ingameui::onMessage(unsigned int uMsg, CCObject* pMsgObj, void* wParam, void* lParam){
	switch(uMsg){
	case MSG_HERO_DEAD:
		{
			m_ingameAnim->showEntrance(this->getPanel(PANEL_INGAME),
			this->getControl(PANEL_INGAME,IMG_INGAME_P_ENTERPLACE));//�������
		}
		break;
	case MSG_MONSTOR_DEAD:
		m_monstorManager->checkMonstorNum();
		break;
	case MSG_BOSS_DEAD:
		m_monstorManager->checkBossNum();
		break;
	case SCENE_INGAME://ʹ�õ���
		{
			if(!m_pHero->isLive()) return;
			GoodsBase *goodsBase = (GoodsBase*)pMsgObj;
			switch(goodsBase->getType()){
			case TYPE_WEAPON:
				{
					Weapon* pWeapon = (Weapon*)goodsBase;
					m_pHero->setWeapon(	pWeapon->getId(),pWeapon->getPowerLength(),pWeapon->getAttackValue());
				}
				break;
			case TYPE_MEDICINE:
				{
					Medicine* pMedicine = (Medicine*)goodsBase;
					m_pHero->resume(pMedicine->getId(),pMedicine->getResumeLength());
				}
				break;
			case TYPE_PROP:
				{
					Prop* pProp = (Prop*)goodsBase;
				}
				break;
			}
				//����Ч��
				//CCParticleSystemQuad* quad = CCParticleSystemQuad::create("res_iphone/ingame/particle_medicine.plist");
				//quad->setPosition(m_pHero->getArmatrue()->getPosition());
				//getPanel(PANEL_INGAME)->addChild(quad);
		}
		break;
	case MSG_RESPON_RESULE:
		{
			m_curLevel = DataProxy::sharedManager()->getLevel();
			m_levelManager->startGame(getPanel(PANEL_INGAME),m_monstorManager,m_pHero,m_arrWeapon,m_curLevel);		  
		}
		break;
	case MSG_PLACEBOSS://��Boss
		m_levelManager->placeBoss(getPanel(PANEL_INGAME),m_monstorManager,m_pHero,m_arrWeapon,m_curLevel);
		break;
	case MSG_ENDGAME://��ʱ1.5��������Ϸ
		this->scheduleOnce(schedule_selector(Ingameui::excuteEndGame),1.5f);
		break;
	case MSG_INTOENTRANCE:
		m_monstorManager->checkIntoNum();
		break;
	}
}

void Ingameui::excuteEndGame(float dt){
	DataProxy::sharedManager()->setWin(m_pHero->isLive());
	m_levelManager->endGame(m_monstorManager);
}

void Ingameui::event_btn_fire(CCObject* s){
	if(!m_pHero->isLive()) return;
	if(!m_pHero->fire()){
		m_monstorManager->checkHurtEnemy(m_pHero);
	}
	/* debug
	vector<CCPoint> v = m_pHero->getFirePoints();
	for(vector<CCPoint>::iterator it=v.begin();it!=v.end();it++){
		CCSprite *pSprite = CCSprite::create("res_iphone/ingame/ball.png");
		pSprite->setPosition(*it);
		getPanel(PANEL_INGAME)->addChild(pSprite);
	}
	*/
}

void Ingameui::event_btn_tool(CCObject* s){
	m_ingameAnim->toggleTool(getPanel(PANEL_INGAME_UI_TOOL));
}

void Ingameui::event_on_move(CCObject* pSender, float fx, float fy){
	if(!m_pHero->isLive()) return;
	float offsetX = fx*m_speed;
	float offsetY = fy*m_speed;
	m_pHero->setPos(offsetX,offsetY);
	m_ingameAnim->moveOffsetToBg(this->getControl(PANEL_INGAME,IMG_BGINGAME1),offsetX,offsetY);
	m_ingameAnim->moveOffsetToMonstorPool(m_monstorManager->getMonstorPool());
	if(m_monstorManager->isShowBoss())
		m_ingameAnim->moveOffsetToMonstorPool(m_monstorManager->getBossPool());
	m_ingameAnim->moveOffsetToEntrance(this->getControl(PANEL_INGAME,IMG_INGAME_P_ENTERPLACE));
}

Ingameui::~Ingameui(){
	m_pHero->release();
	m_monstorManager->clear();
	m_monstorManager->release();
	m_ingameAnim->release();
	m_levelManager->release();
	m_commAnim->release();

	m_arrWeapon->release();
	m_arrMedicine->release();
	m_arrProp->release();
}

/************************************************************************/
//	GET/SET/IS
/************************************************************************/
CCNode* Ingameui::getPanel(int tagPanel){
	CCNode *panel = NULL;
	switch(tagPanel){
	case PANEL_INGAME:
		panel = this->getChildByTag(PANEL_INGAME);
		break;
	case PANEL_INGAME_UI:
		panel = this->getChildByTag(PANEL_INGAME)->getChildByTag(PANEL_INGAME_UI);
		break;
	case PANEL_INGAME_UI_TOOL:
		panel = this->getChildByTag(PANEL_INGAME)->getChildByTag(PANEL_INGAME_UI)->getChildByTag(PANEL_INGAME_UI_TOOL);
		break;
	}
	return panel;
}

Hero* Ingameui::getHero(){
	return m_pHero;
}
#include "MonstorMgr.h"

bool MonstorMgr::init(){
	m_poolMonstor = CCArray::create();
	m_poolMonstor->retain();
	m_poolBoss = CCArray::create();
	m_poolBoss->retain();

	m_isPlaceBoss = false;
	m_hadSendMonstorDead = false;
	m_hadSendBossDead = false;
	return true;
}

void MonstorMgr::pushMonstor(Monstor* pMonstor){
	m_poolMonstor->addObject(pMonstor);
}

Monstor* MonstorMgr::popMonstor(){
	Monstor* monstor = (Monstor*)m_poolMonstor->lastObject();
	return monstor;
}

void MonstorMgr::createMonstors(int size,const char* name,const char* png,const char* plist,const char* xml){
	
	CCArmatureDataManager::sharedArmatureDataManager()->addArmatureFileInfo(png,plist,xml);
	for(int i=0;i<size; i++){
		Monstor* pMonstor = Monstor::create();
		pMonstor->setArmature(CCArmature::create(name));
		m_poolMonstor->addObject(pMonstor);
	}
}

void MonstorMgr::createBosss(int size,const char* name,const char* png,const char* plist,const char* xml){

	CCArmatureDataManager::sharedArmatureDataManager()->addArmatureFileInfo(png,plist,xml);
	for(int i=0;i<size; i++){
		Boss* pBoss = Boss::create();
		pBoss->setArmature(CCArmature::create(name));
		m_poolBoss->addObject(pBoss);
	}
}

void MonstorMgr::initMonstor(CCNode* container,Hero *pHero){
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* monstor = (Monstor*)obj;
		if(!monstor->getArmatrue()->getParent()){
			monstor->createHpSlider(container);
			monstor->setPos(CCRANDOM_MINUS1_1()*800,CCRANDOM_MINUS1_1()*800);
			monstor->setAttackObj(pHero);
			container->addChild(monstor->getArmatrue());
		}
	}
}

void MonstorMgr::initBoss(CCNode* container,Hero* pHero){
	m_isPlaceBoss = true;//���Boss�ѳ���
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolBoss,obj){
		Boss* pBoss = (Boss*)obj;
		pBoss->createHpSlider(container);
		pBoss->setPos(CCRANDOM_MINUS1_1()*800,CCRANDOM_MINUS1_1()*480);
		pBoss->setAttackObj(pHero);
		container->addChild(pBoss->getArmatrue());
	}
}

void MonstorMgr::checkHurtHero(CharacterBase *characterBase){
	Hero *pHero = (Hero*)characterBase;
	if(!pHero->isLive()) return;
	float tagX = pHero->getArmatrue()->getPositionX();
	float tagY = pHero->getArmatrue()->getPositionY();

	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* monstor = (Monstor*)obj;
		if(monstor->isLive()){
			monstor->chase(tagX,tagY);
			if(monstor->isCollision(characterBase)){
				monstor->attack();//����
			}else{
				monstor->attackStop();//ֹͣ����
			}
		}
	}
	if(!m_isPlaceBoss) return;
	obj = NULL;
	CCARRAY_FOREACH(m_poolBoss,obj){
		Boss* pBoss = (Boss*)obj;
		if(pBoss->isLive()){
			pBoss->chase(tagX,tagY);
			if(pBoss->isCollision(characterBase)){
				pBoss->attack();//��ʼ����
			}
		}
	}
}

void MonstorMgr::checkHurtEnemy(CharacterBase *characterBase){
	Hero *pHero = (Hero*)characterBase;
	if(!pHero->isLive()) return;
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* monstor = (Monstor*)obj;
		if(pHero->isCollision(monstor)){
			monstor->hurt(pHero->getAttackValue());//��Ѫ
		}
	}
	if(!m_isPlaceBoss) return;
	obj = NULL;
	CCARRAY_FOREACH(m_poolBoss,obj){
		Boss* pBoss = (Boss*)obj;
		if(pHero->isCollision(pBoss)){
			pBoss->hurt(pHero->getAttackValue());//��Ѫ
		}
	}
}

void MonstorMgr::checkMonstorNum(){
	int countLive = 0;
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* item = (Monstor*) obj;
		if(item->isLive()) countLive++;
	}
	if(countLive == 0){//û�������Ĺ���
		if(!m_hadSendMonstorDead){
			m_hadSendMonstorDead = true;//�����ظ�������Ϣ
			CCMsgManager::sharedManager()->PostMessage(MSG_PLACEBOSS);//��boss
		}
	}
}

void MonstorMgr::checkBossNum(){
	int countLive = 0;
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolBoss,obj){
		Boss* item = (Boss*) obj;
		if(item->isLive()) countLive++;
	}
	if(countLive == 0){//û��������Boss
		if(!m_hadSendBossDead){
			m_hadSendBossDead = true;//�����ظ�������Ϣ
			CCMsgManager::sharedManager()->PostMessage(MSG_ENDGAME);//��Ϸ����
		}
	}
}

void MonstorMgr::checkIntoNum(){
	CCObject* obj = NULL;
	int count = 0;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* pMonstor = (Monstor*) obj;
		if(pMonstor->getArmatrue()->isVisible() && pMonstor->isLive()){//�����߽�ҽԺ�Ĺ���
			count++;
		}
	}
	obj = NULL;
	CCARRAY_FOREACH(m_poolBoss,obj){
		Boss* pBoss = (Boss*) obj;
		if(pBoss->getArmatrue()->isVisible() && pBoss->isLive()){
			count++;
		}
	}
	if(count == 0){//ȫ������ҽԺ��
		CCMsgManager::sharedManager()->PostMessage(MSG_ENDGAME);
	}
}

void MonstorMgr::walkToEntrance(CCNode* entrance){
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* monstor = (Monstor*)obj;
		if(monstor->isLive()){
			bool isInto = monstor->chase(entrance->getPositionX(),entrance->getPositionY());
			if(isInto){
				if(monstor->getArmatrue()->isVisible())
				monstor->intoHospital();
			}
		}
	}

	if(m_isPlaceBoss){
		obj = NULL;
		CCARRAY_FOREACH(m_poolBoss,obj){
			Boss* pBoss = (Boss*) obj;
			if(pBoss->isLive()){
				bool isInto = pBoss->chase(entrance->getPositionX(),entrance->getPositionY());
				if(isInto){
					if(pBoss->getArmatrue()->isVisible())
						pBoss->intoHospital();
				}
			}
		}
	}
}

void MonstorMgr::clear(){
	CCObject* obj = NULL;
	CCARRAY_FOREACH(m_poolMonstor,obj){
		Monstor* monstor = (Monstor*)obj;
		monstor->attackStop();
		monstor->getArmatrue()->removeFromParent();
	}
	m_poolMonstor->removeAllObjects();
	if(m_isPlaceBoss){
		CCObject* obj2 = NULL;
		CCARRAY_FOREACH(m_poolBoss,obj2){
			Boss* pBoss = (Boss*)obj2;
			pBoss->getArmatrue()->removeFromParent();
		}
	}
	m_poolBoss->removeAllObjects();
	m_isPlaceBoss = false;
	m_hadSendMonstorDead = false;
	m_hadSendBossDead = false;
}

MonstorMgr::~MonstorMgr(){
	m_poolMonstor->release();
	m_poolBoss->release();
}

/*************************************************************************/
// GET/SET/IS                                                         
/************************************************************************/
CCArray* MonstorMgr::getMonstorPool(){
	return this->m_poolMonstor;
}

CCArray* MonstorMgr::getBossPool(){
	return this->m_poolBoss;
}

bool MonstorMgr::isShowBoss(){
	return m_isPlaceBoss;
}
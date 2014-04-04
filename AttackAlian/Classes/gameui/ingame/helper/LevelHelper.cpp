#include "LevelHelper.h"


bool LevelMgr::init(){
	return true;
}

void LevelMgr::startGame(CCNode* panel,MonstorMgr* pMonstorManager,Hero *pHero,CCArray* arrWeapon,int level){
	//��ʼ��Ӣ��װ��
	initHero(pHero,arrWeapon);
	//��������
	pMonstorManager->createMonstors(50,CCString::createWithFormat("armature_monster%d",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_monster%d.png",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_monster%d.plist",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_monster%d.xml",level)->getCString());
	pMonstorManager->initMonstor(panel,pHero);
	
	//������ڶ���
	panel->removeChildByTag(TMP_ENTRANCEANIM_TAG);
}

void LevelMgr::placeBoss(CCNode* panel,MonstorMgr* pMonstorManager,Hero *pHero,CCArray* arrWeapon,int level){
	//����boss
	pMonstorManager->createBosss(2,CCString::createWithFormat("armature_boss%d",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_boss%d.png",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_boss%d.plist",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_boss%d.xml",level)->getCString());
	pMonstorManager->initBoss(panel,pHero);
	//�����������
	pMonstorManager->createMonstors(15,CCString::createWithFormat("armature_monster%d",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_monster%d.png",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_monster%d.plist",level)->getCString(),
		CCString::createWithFormat("res_iphone/ingame/armature_monster%d.xml",level)->getCString());
	pMonstorManager->initMonstor(panel,pHero);
}

void LevelMgr::endGame(MonstorMgr* pMonstorManager){
	pMonstorManager->clear();
	CCSceneManager::sharedManager()->runUIScene(LoadScene("Resuleui"));
}

void LevelMgr::initHero(Hero* pHero,CCArray* arrWeapon){
	pHero->setHp(pHero->getMaxHp());
	pHero->setLive(true);
	if(arrWeapon->count()>0){
		Weapon* goodItem = (Weapon*)arrWeapon->objectAtIndex(0);
		pHero->setWeapon(goodItem->getId(),goodItem->getPowerLength(),goodItem->getAttackValue());
	}else{
		pHero->setWeapon(0,WEAPON_BASE_POWERLENGTH,WEAPON_BASE_ATTACTVALUE);
	}
}
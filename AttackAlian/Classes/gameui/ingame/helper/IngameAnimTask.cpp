#include "IngameAnimTask.h"

bool IngameAnimTask::init(){
	m_bToggleTool = false;
	return true;
}

void IngameAnimTask::moveOffsetToBg(CCNode *bg,float offsetX,float offsetY){

	CCSize mapSize = bg->getContentSize();
	CCSize visibleSize = CCDirector::sharedDirector()->getVisibleSize();
	m_offsetPos = ccp(offsetX,offsetY);//������������ƶ�AI�õ�
	//-----------------------���Ƶ�ͼ���з�Χ-------------------------------
	bg->setPosition(bg->getPosition()+ CCPoint(offsetX*(-1),offsetY*(-1)));

	if(bg->getPositionX() > mapSize.width/2 - visibleSize.width/2){//��߽�
		bg->setPositionX(mapSize.width/2 - visibleSize.width/2);
		m_offsetPos.x = 0;
	}else if(bg->getPositionX() < -mapSize.width/2 + visibleSize.width/2){//�ұ߽�
		bg->setPositionX(-mapSize.width/2 + visibleSize.width/2);
		m_offsetPos.x = 0;
	}

	if(bg->getPositionY() < -mapSize.height/2 + visibleSize.height/2){//�ϱ߽�
		bg->setPositionY(-mapSize.height/2 + visibleSize.height/2);
		m_offsetPos.y = 0;
	}else if(bg->getPositionY() > mapSize.height/2 - visibleSize.height/2){//�±߽�
		bg->setPositionY(mapSize.height/2 - visibleSize.height/2 );
		m_offsetPos.y = 0;
	}
}

void IngameAnimTask::moveOffsetToMonstorPool(CCArray *pool){
	CCObject* obj = NULL;
	CCARRAY_FOREACH(pool,obj){
		CharacterBase* pMonstor = (CharacterBase*)obj;
		float tagX = pMonstor->getArmatrue()->getPositionX() - m_offsetPos.x;//���ݵ�ͼ��ƫ�����ƶ�
		float tagY = pMonstor->getArmatrue()->getPositionY() - m_offsetPos.y;
		pMonstor->setPos(tagX,tagY);
	}
}

void IngameAnimTask::moveOffsetToEntrance(CCNode *entrance){
	float tagX = entrance->getPositionX() - m_offsetPos.x;//���ݵ�ͼ��ƫ�����ƶ�
	float tagY = entrance->getPositionY() - m_offsetPos.y;
	entrance->setPosition(ccp(tagX,tagY));
}

void IngameAnimTask::toggleTool(CCNode *panel){
	m_bToggleTool = !m_bToggleTool;
	CCAction* action = NULL;
	action = m_bToggleTool ? CCMoveBy::create(0.3f,ccp(0,-70)) : CCMoveBy::create(0.3f,ccp(0,70));
	panel->runAction(action);
}

//չʾ���
void IngameAnimTask::showEntrance(CCNode* panel,CCNode* pos){
	CCSpriteFrameCache::sharedSpriteFrameCache()->addSpriteFramesWithFile("res_iphone/ingame/anim_entrance.plist",
		"res_iphone/ingame/anim_entrance.png");
	CCAnimation* pAnim = AnimationUtil::createAnimWithName("anim_entrance",0.05f,1);
	pAnim->setRestoreOriginalFrame(false);
	CCSprite* pSprite = CCSprite::create();
	pSprite->setPosition(pos->getPosition());
	pSprite->runAction(CCAnimate::create(pAnim));
	pSprite->setTag(TMP_ENTRANCEANIM_TAG);
	panel->addChild(pSprite);
}

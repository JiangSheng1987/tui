#ifndef __DOMAINBASE_H__
#define __DOMAINBASE_H__

#include "cocos2d.h"
#include "cocos-ext.h"
#include "domain/config.h"
#include "../../CocosBase/cocos-base.h"
#include "../../CocosWidget/cocos-widget.h"

using namespace std;
using namespace cocos2d::cocoswidget;
using namespace cocos2d::extension;
USING_NS_CC;

class CharacterBase : public CCObject
{
public:
	CREATE_FUNC(CharacterBase);

	virtual bool init();
	virtual void setPos(float x, float y);//�ƶ�
	
	virtual void createHpSlider(CCNode *container);
	virtual void sortZorder();
	virtual void hurt(int v);

	virtual void cb_anim_hplabel(CCNode *pNode);

	virtual bool chase(float tagX,float tagY);//׷��
	virtual bool isCollision(CCObject* obj);
	virtual bool isLive();

	virtual void setHp(int v);
	virtual int getHp();
	virtual int getMaxHp();
	virtual void setLive(bool b);
	virtual void setArmature(CCArmature* pArmature);//ͨ������ ��������
	virtual void setAttackObj(CCObject* obj);//���ù�������
 	virtual CCObject* getAttackObj();//��ȡ��������
	virtual CCArmature* getArmatrue();
	virtual CSlider* getHPSlider();
	virtual int getAttackValue();
	virtual void setAttackValue(int v);
protected:
	CCArmature* m_pArmature;
	CSlider* m_pHPSlider;
	CCObject* m_pAttackObj;

	int m_attackValue;//�˺�ֵ
	bool m_isLive;//�Ƿ񻹻��� 
	int m_life;//����ֵ
	int m_maxHpValue;//�������ֵ

	bool m_isAttack;//�Ƿ����ڹ���

	int m_vx;
	int m_vy;
	int m_speed;
private:
};
#endif
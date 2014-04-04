#ifndef __GAME_CONTROLLER_H__
#define __GAME_CONTROLLER_H__

#include "domain/config.h"
#include "domain/character/Hero.h"
#include "cocos2d.h"
USING_NS_CC;

class DataProxy : public CCObject
{
public:
	static DataProxy* sharedManager();
	bool virtual init();

	CC_SYNTHESIZE(int,m_coin, Coin);//��ǰ�����
	CC_SYNTHESIZE(int,m_level,Level);//��ǰ�ؿ�
	CC_SYNTHESIZE(bool,m_isWin,Win);//�Ƿ�ʤ��

	CC_SYNTHESIZE(Hero*,m_hero,Hero);//��ǰ���
	CC_SYNTHESIZE(CCArray*,m_arrWeapon,ArrWeapon);//��ǰ����
	CC_SYNTHESIZE(CCArray*,m_arrMedicine,ArrMedicine);//��ǰҩˮ
	CC_SYNTHESIZE(CCArray*,m_arrProp,ArrProp);//��ǰ����

protected:
private:
	static DataProxy* m_instance;
};

#endif
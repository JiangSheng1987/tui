#ifndef __HERO_H__
#define __HERO_H__

#include "domain/character/CharacterBase.h"

class Hero : public CharacterBase{
public:
	CREATE_FUNC(Hero);
	virtual bool init();

	~Hero();

	void setPos(float x, float y);//�ƶ�
	inline void setDir(float x, float y);//ת��
	void setWeapon(int id,int powerLength,int attackValue);//�л�����
	void resume(int id,int resumeLength);//�ָ�Ѫ��
	void useProp(int id);//ʹ�õ���

	bool fire();
	bool isCollision(CCObject* checkObj);
	void hurt(int v);

protected:
	vector<CCPoint> getFirePoints();//��ȡ��ǹ������
private:
	double m_angelDir;
	double m_angelDirLast;//��¼��һ�εķ�λ

	int m_weaponId;//�����±�
	int m_powerLength;//������������
};	
#endif
const data = [
	{
		name: 'Animal Hunter',
		type: 'talent',
		'system.description': 'You know how to track the creatures of the wilds, bring down the bison, stalk the cougar and set traps for beaver and bear.',
		'system.basicAction': 'All your attacks against wild animals, and rolls to set traps, gain a +1 bonus.',
		'system.advAction': 'Your attacks against wild animals (including from traps) automatically cause a critical injury if you inflict any damage.',
		'system.reference': 'animalhunter',
	},
	{
		name: 'Authority',
		type: 'talent',
		'system.description': 'You have the weight of authority on your side, whether from the law, the big man in town or just your own personality.',
		'system.basicAction': 'You gain a +1 bonus to PRESENCE tests.',
		'system.advAction':
			'In a duel you use the weight of your authority to get the drop on your enemy. After you have pushed your PRESENCE roll using a Faith Point, you can push a second time for free.',
		'system.reference': 'authority',
	},
	{
		name: 'Born In The Saddle',
		type: 'talent',
		'system.description': 'Riding comes as naturally to you as breathing does to everyone else.',
		'system.basicAction': 'You gain a +1 bonus to all ANIMAL HANDLIN’ rolls that relate to horses.',
		'system.advAction':
			'There is no one better in the saddle than you. When you Drive Hard in a chase on horseback you gain a +3 bonus to ANIMAL HANDLIN’ instead of +2, and your horse gains +3 to its RESILIENCE rolls during the chase.',
		'system.reference': 'borninthesaddle',
	},
	{
		name: 'Bow Master',
		type: 'talent',
		'system.description': 'The bow is the weapon of a true man from a more civilized culture.',
		'system.basicAction': 'You can use a bow up to Long range with no penalties.',
		'system.advAction': 'You know where to hit for maximum impact: your shots with a bow inflict double the normal damage.',
		'system.reference': 'bowmaster',
	},
	{
		name: 'Bowyer',
		type: 'talent',
		'system.description': 'You know how to turn wood, leather and twine into lethal bows.',
		'system.basicAction': 'You can use the MAKIN’ ability to make and repair bows and arrows with normal stats.',
		'system.advAction':
			'You can make high-quality bows. For each success after the first on your MAKIN’ test you can add a weapon quality of your choice. This can be used to add new qualities to an existing bow.',
		'system.reference': 'bowyer',
	},
	{
		name: 'Brawler',
		type: 'talent',
		'system.description': 'You don’t need weapons to bring down your enemies.',
		'system.basicAction': 'All your unarmed attacks and Blocks have a +1 bonus.',
		'system.advAction':
			'If you gain any successes when Blocking a melee attack (even if the attack still causes some damage) you can immediately attempt to Grapple your opponent as a free action.',
		'system.reference': 'brawler',
	},
	{
		name: 'Bronc Buster',
		type: 'talent',
		'system.description': 'You know how to handle and train horses. ',
		'system.basicAction': 'You can break and train wild horses, using the Breaking & Training Horses rules (page XXX).',
		'system.advAction': 'You are a Horse Whisperer. When making a roll to break or train a horse you automatically gain one bonus success.',
		'system.reference': 'broncbuster',
	},
	{
		name: 'Business Minded',
		type: 'talent',
		'system.description': 'Business is in your blood.',
		'system.basicAction':
			'You have great business acumen, and whether from your business strategy, good salesmanship or bad-mouthing the competition, your business always does well. Your modifier for Competition is always +1 better than it should be, up to a maximum of +3.',
		'system.advAction':
			'You have the best business mind around. Whenever you gain a dividend from points of Capital you have invested in an outfit you increase your personal bonus by 50%.',
		'system.reference': 'businessminded',
	},
	{
		name: 'Calming Manner',
		type: 'talent',
		'system.description': 'You reassure troubled minds just with the calm in your voice.',
		'system.basicAction':
			'With a successful PRESENCE test you can calm those around you, and even yourself, healing 1 point of Vexes or Doubts for every success. This talent also allows you to provide help to another character who is making a DOCTORIN’ roll, without having that ability yourself, as your voice calms the patient.',
		'system.advAction':
			'In a social conflict your calming manner is very disarming to your opponent. You gain a +2 bonus to PRESENCE or PERFORMIN’ when you attempt to inflict Doubts on an opponent. ',
		'system.reference': 'calmingmanner',
	},
	{
		name: 'Charming',
		type: 'talent',
		'system.description': 'You are skilled in the arts of persuasion.',
		'system.basicAction': 'You gain a +1 bonus to PERFORMIN’ when trying to charm, seduce or schmooze someone.',
		'system.advAction':
			'People just seem to trust you. Trouble does not apply when you try to charm, seduce, or schmooze someone—when you push your PERFORMIN’ roll, you can reroll 1s on Trouble Dice, and you ignore any Trouble rolled.',
		'system.reference': 'charming',
	},
	{
		name: 'Cold Blooded',
		type: 'talent',
		'system.description': 'You are completely callous and can kill defenseless enemies without so much as a second’s hesitation.',
		'system.basicAction': 'You can perform a coup de grace without needing to make a Docity test, but you still lose a point of Docity.',
		'system.advAction':
			'You never need to make a roll to kill a person who is defenseless, but this ruthlessness can be seen in your every move and the expression on your face. When you perform a coup de grace you recover a point of Docity instead of losing one. ',
		'system.reference': 'coldblooded',
	},
	{
		name: 'Companion',
		type: 'talent',
		'system.description':
			'Your horse is your closest companion (when it dies you lose this talent, but can take it again at half price when you get a new horse).',
		'system.basicAction':
			'Your horse gains the LOYAL quality and will stand by your side and defend you if you’re Broken (this can take your horse’s total qualities over the normal maximum).',
		'system.advAction':
			'You and your horse are so in tune that when you are in the saddle your steed can make one attack during combat, in addition to your actions.',
		'system.reference': 'companion',
	},
	{
		name: 'Dead Eye',
		type: 'talent',
		'system.description': 'You know where to shoot to make your opponent fall and not get up again. Ever.',
		'system.basicAction': 'When you make a Called Shot, reduce the penalty by 1.',
		'system.advAction': 'If you succeed with your Called Shot you gain an additional critical injury roll, over and above any inflicted by the attack.',
		'system.reference': 'deadeye',
	},
	{
		name: 'Deadly Strike',
		type: 'talent',
		'system.description': 'You know where to hit a man to make sure he doesn’t get up again. Ever.',
		'system.basicAction': 'When you make a Called Strike, reduce the penalty by 1.',
		'system.advAction': 'If you succeed with your Called Strike you gain an additional critical injury roll, over and above any inflicted by the attack.',
		'system.reference': 'deadlystrike',
	},
	{
		name: 'Defender',
		type: 'talent',
		'system.description': 'You are skilled at defending yourself in a fight.',
		'system.basicAction': 'Successfully Blocking an attack gives you a cumulative +1 to your next Block against the same target, to a maximum of +3.',
		'system.advAction': 'You get one free Block per Round during a fight. This does not count as one of your actions in the Round.',
		'system.reference': 'defender',
	},
	{
		name: 'Engineer',
		type: 'talent',
		'system.description': 'You know how these new-fangled machines work and are skilled at using and repairing them. ',
		'system.basicAction':
			'You’re a natural with these new contraptions. You have the skills and knowledge to work as an engineer on a railroad or in a manufactory and gain a +1 bonus to OPERATE when fixing machines.',
		'system.advAction': 'Machines just make sense to you. After you have pushed your OPERATE roll using a Faith Point, you can push a second time for free.',
		'system.reference': 'engineer',
	},
	{
		name: 'Expert Fanning',
		type: 'talent',
		'system.description': 'The calluses on your hands say you know how to fan your iron.',
		'system.basicAction': 'When you finish a fanning attack you always have one bullet left in your revolver.',
		'system.advAction':
			'You are a skilled shot when fanning your pistol. You do not suffer the −2 penalty when fanning, but still suffer the penalties for shooting more than one target.',
		'system.reference': 'expertfanning',
	},
	{
		name: 'Fast Footwork',
		type: 'talent',
		'system.description': 'You are fast on your feet and can avoid being hit by physical attacks.',
		'system.basicAction':
			'You gain a +1 bonus to MOVE tests when Dodging or fleeing a melee or similar ruckus (not gunshots), and when retreating behind cover.',
		'system.advAction':
			'You are hard to chase down. Every time you Drive Hard in a chase on foot you gain a +3 bonus instead of the usual +2, and you gain a +3 bonus on your RESILIENCE rolls during the chase.',
		'system.reference': 'fastfootwork',
	},
	{
		name: 'Fast Shooter',
		type: 'talent',
		'system.description': 'You handle your pistol with speed and alacrity.',
		'system.basicAction': 'No one is faster than you in a gunfight. You only suffer a −1 penalty when making a Quick Shot, instead of −2. ',
		'system.advAction': 'You’re so quick that you don’t need to spend an action to Prepare before you attack with a single-action pistol.',
		'system.reference': 'fastshooter',
	},
	{
		name: 'Flying Blade',
		type: 'talent',
		'system.description': 'You are a master of the throwing knife or the tomahawk as a thrown weapon.',
		'system.basicAction': 'Your attack rolls gain a +1 bonus when you use a thrown weapon.',
		'system.advAction':
			'Your throws get more accurate the more you try, and for every attack against the same target after the first you gain a +1 SHOOTIN’ bonus, to a maximum of +3.',
		'system.reference': 'flyingblade',
	},
	{
		name: 'Forger',
		type: 'talent',
		'system.description': 'You are a skilled forger, able to craft fake documents and papers.',
		'system.basicAction': 'You know how to make documents look good. Gain a +1 bonus to your LIGHT-FINGERED roll when drawing up a forgery.',
		'system.advAction':
			'You are a master forger, and can make an accurate forgery of any document provided you have the time to study it and the resources to create it. You gain one bonus success on your LIGHT-FINGERED roll.',
		'system.reference': 'forger',
	},
	{
		name: 'Gambler',
		type: 'talent',
		'system.description': 'You are an expert at every kind of card game and know how to win any which way.',
		'system.basicAction': 'Choose a Gambling Tactic and gain a +1 bonus in that Tactic. This talent can be taken once for each Gambling Tactic.',
		'system.advAction':
			'Choose a Gambling Tactic you already possess at the Basic rank and gain another +1 bonus in that Tactic. Also, you don’t suffer the penalty for repeat uses of the same Tactic when Gambling. This talent can be taken once for each Gambling Tactic.',
		'system.reference': 'gambler',
	},
	{
		name: 'Guard Dog',
		type: 'talent',
		'system.description':
			'You have a loyal companion that stands by your side and will defend you to the death (when your dog dies you lose this talent, but can take it again at half price when you get a new dog).',
		'system.basicAction': 'Your dog is big and dangerous, and growls to order. Gain a +1 bonus to your PRESENCE when intimidating someone alongside your dog.',
		'system.advAction':
			'Your dog can attack a target. You spend a fast action to give it the order and it will attack the target until that target is dead, the dog is Broken or dead, or you call it off. Calling the dog off its target requires a slow action and a successful ANIMAL HANDLIN’ roll, or the dog continues to attack.',
		'system.reference': 'guarddog',
	},
	{
		name: 'Gunsmith',
		type: 'talent',
		'system.description': 'You are skilled at the art of crafting firearms.',
		'system.basicAction': 'You can make and repair all types of firearm with normal stats, using your MAKIN’ ability.',
		'system.advAction':
			'You can make high-quality firearms. For each success after the first on your MAKIN’ test you can add a weapon quality of your choice. This can be used to add new qualities to an existing weapon.',
		'system.reference': 'gunsmith',
	},
	{
		name: 'Hard To Hit',
		type: 'talent',
		'system.description': 'You’re a tough opponent in a fight, and laying a blow on you is hard. ',
		'system.basicAction': 'You gain a +1 bonus to your FIGHTIN’ dice when Blocking a melee attack.',
		'system.advAction': 'You’re such an expert in a fight that you can Block an attack made with a melee weapon or by an animal, even if you’re unarmed.',
		'system.reference': 'hardtohit',
	},
	{
		name: 'Hay-Maker',
		type: 'talent',
		'system.description': 'When you put your all into an attack there’s no stopping you.',
		'system.basicAction': 'When you spend a fast action to go for an All-Out Attack in a fight you gain a +3 bonus instead of the usual +2.',
		'system.advAction': 'When you make an All-Out Attack with a melee weapon, any attempt by your opponent to Block the attack suffers a −3 modifier.',
		'system.reference': 'haymaker',
	},
	{
		name: 'Healing Touch',
		type: 'talent',
		'system.description': 'You’re a natural healer.',
		'system.basicAction': 'When you successfully heal a Broken person you double the number of attribute points that are restored.',
		'system.advAction':
			'You don’t let patients die. If a failed DOCTORIN’ test would cause your patient to die, you can immediately reroll it once as a free action.',
		'system.reference': 'healingtouch',
	},
	{
		name: 'Herbalist',
		type: 'talent',
		'system.description':
			'You have learned the healing ways of nature and the land, and how they can be twisted with malicious intent. You are a healer, a druggist, or an apothecary.',
		'system.basicAction': 'You can concoct healing elixirs and salves from herbs and plants, which give you a +1 bonus to DOCTORIN’ tests.',
		'system.advAction':
			'There is little you do not know about the healing powers and dangers of nature. You gain a +2 bonus to DOCTORIN’ when working against poison, venom or sickness, and can create poisons with a Potency of 2.',
		'system.reference': 'herbalist',
	},
	{
		name: 'High Society',
		type: 'talent',
		'system.description': 'You move in exalted circles.',
		'system.basicAction':
			'You know who to talk to and what their dirty secrets are. You gain a +1 bonus to PRESENCE or PERFORMIN’ when talking to anyone where Fame or social standing might have a bearing.',
		'system.advAction': 'When dealing with anyone where Fame or social standing might have a bearing you gain 3 bonus points of Fame for that scene. ',
		'system.reference': 'highsociety',
	},
	{
		name: 'Horse Warrior',
		type: 'talent',
		'system.description': 'You are trained in fighting from a moving horse.',
		'system.basicAction': 'You gain a +1 bonus to all attacks from a mount.',
		'system.advAction': 'You are so skilled on horseback you can use a two-handed weapon from a mount.',
		'system.reference': 'horsewarrior',
	},
	{
		name: 'Judge Of Character',
		type: 'talent',
		'system.description': 'You can read other people like a book and smell a lie a mile off.',
		'system.basicAction': 'You gain a +1 bonus to INSIGHT tests to see if someone is lying or trying to pull the wool over your eyes.',
		'system.advAction':
			'Not only can you spot the lie, but you can see the truth that’s being hidden. For every success beyond the first on an INSIGHT test you can ask the GM a question about the lie and the truth it conceals. They must answer as truthfully as possible.',
		'system.reference': 'judgeofcharacter',
	},
	{
		name: 'Knife Fighter',
		type: 'talent',
		'system.description': 'You are lethal with a knife in hand.',
		'system.basicAction': 'Gain a +1 bonus to your FIGHTIN’ rolls when you fight with a knife in your hand.',
		'system.advAction': 'Once per Round you can make a melee attack as a fast action using a knife, without a penalty.',
		'system.reference': 'knifefighter',
	},
	{
		name: 'Lawyer',
		type: 'talent',
		'system.description': 'You may have gone to school or learned your law over a lantern late at night. One way or another, you know your rights.',
		'system.basicAction':
			'You can add the number of successes from a BOOKLEARNIN’ roll (as a free action) as bonus dice to your PERFORMIN’ test when trying to influence someone using your knowledge of the law or other official information.',
		'system.advAction': 'You are so well-schooled in the law that you can act as a Judge In Good Standing. Your Fame increases by 3.',
		'system.reference': 'lawyer',
	},
	{
		name: 'Light-Footed',
		type: 'talent',
		'system.description': 'You walk like the spirits, leaving no trail behind you.',
		'system.basicAction': 'You gain a +1 bonus to your NATURE roll when you’re trying to avoid someone tracking you.',
		'system.advAction':
			'You are an expert at laying false tracks. When you’re trying to avoid being tracked, each success on your NATURE test counts as two successes.',
		'system.reference': 'lightfooted',
	},
	{
		name: 'Lightning Fast',
		type: 'talent',
		'system.description': 'You react with the speed of a snake.',
		'system.basicAction': 'You draw two initiative cards instead of one during the initiative draw. Choose the one you want to use and discard the other.',
		'system.advAction': 'When you spot an ambush or a sneak attack you get a slow and a fast action before initiative is drawn.',
		'system.reference': 'lightningfast',
	},
	{
		name: 'Lockpicker',
		type: 'talent',
		'system.description': 'You have mastered the art of picking locks and cracking safes.',
		'system.basicAction': 'Your LIGHT-FINGERED roll is modified by +1 when you pick a lock.',
		'system.advAction': 'You can crack safes with LIGHT-FINGERED, or use OPERATE to blow them open with dynamite. You gain a +1 bonus to your rolls.',
		'system.reference': 'lockpicker',
	},
	{
		name: 'Lucky',
		type: 'talent',
		'system.description': 'No matter how bad the odds you always seem to get away unscathed.',
		'system.basicAction': 'When you suffer a critical injury you can reroll the Tens die and take the best result.',
		'system.advAction': 'When you suffer a critical injury you can reroll the Units die and take the best result.',
		'system.reference': 'lucky',
	},
	{
		name: 'Man’s Best Friend',
		type: 'talent',
		'system.description':
			'Not every dog is the perfect friend, but yours is (when your dog dies you lose this talent but can take it again at half price when you get a new dog).',
		'system.basicAction': 'Your dog can help you track, giving you a +1 bonus to HAWKEYE when tracking.',
		'system.advAction':
			'Your loyal friend can help you when you are Broken. Once per session your dog’s presence is comforting and immediately restores 1D3 to the Broken attribute.',
		'system.reference': 'mansbestfriend',
	},
	{
		name: 'Manhunter',
		type: 'talent',
		'system.description': 'You have spent years chasing down your quarry.',
		'system.basicAction': 'You gain a +1 bonus to HAWKEYE when tracking your quarry across the wilderness. ',
		'system.advAction':
			'You never give up when on the hunt and can push your HAWKEYE roll for a second time for free when tracking people or animals in the wild.',
		'system.reference': 'manhunter',
	},
	{
		name: 'Miner 49er',
		type: 'talent',
		'system.description': 'You are experienced in handling dangerous explosives. ',
		'system.basicAction':
			'You can recognize sweating dynamite and other danger signs. Treat Trouble on dynamite ability rolls as normal (that is, Trouble is not activated unless the roll is pushed—see page XXX)',
		'system.advAction':
			'You know just where to put dynamite for best effect. When dynamite you have set detonates you double the number of successes resulting from the Blast Power roll.',
		'system.reference': 'miner49er',
	},
	{
		name: 'Mountain Folk',
		type: 'talent',
		'system.description': 'You have lived your life in the mountains.',
		'system.basicAction': 'Gain a +1 bonus to NATURE and RESILIENCE tests when in the wilderness. ',
		'system.advAction':
			'You do not suffer any conditions until twice the usual time has elapsed, and gain an extra +2 bonus when making camp or constructing a shelter.',
		'system.reference': 'mountainfolk',
	},
	{
		name: 'Pistoleer',
		type: 'talent',
		'system.description': 'You are an expert with your pistol.',
		'system.basicAction': 'You are skilled with the iron and gain a +1 bonus to your SHOOTIN’ dice when using a pistol.',
		'system.advAction': 'You are so accurate that you always hit where you aimed. The Called Shot penalty is only −1 instead of −3, when using a pistol.',
		'system.reference': 'pistoleer',
	},
	{
		name: 'Poisoner',
		type: 'talent',
		'system.description': 'You know all about the darker arts of poisons and venom.',
		'system.basicAction': 'You understand the basics of deadly plants and animals and can concoct poisons with a Potency of 2.',
		'system.advAction': 'You understand hemlock, arsenic and strychnine, as well as spider, scorpion and snake venom. You can mix poisons with a Potency of 3.',
		'system.reference': 'poisoner',
	},
	{
		name: 'Pugilist',
		type: 'talent',
		'system.description': 'You are an expert fist fighter.',
		'system.basicAction':
			'In a hand-to-hand fight you can anticipate your enemy’s every move. You may swap your initiative card with an opponent you are actively fighting.',
		'system.advAction':
			'Once per Round, when you hit your opponent in a fight, you can immediately throw a combination punch: you punch again immediately as a free action.',
		'system.reference': 'pugilist',
	},
	{
		name: 'Quick Draw',
		type: 'talent',
		'system.description': 'You draw your weapon faster than your enemy can blink.',
		'system.basicAction':
			'Once per Round you can draw a one-handed weapon without spending an action. This includes picking up a weapon from the ground. You also gain a +1 bonus to your Draw roll during a duel.',
		'system.advAction':
			'Your draw is so smooth that Trouble does not apply when you Draw your pistol in a duel. When you push your LIGHT-FINGERED roll, you can reroll 1s on Trouble Dice, and you ignore any Trouble rolled.',
		'system.reference': 'quickdraw',
	},
	{
		name: 'Rabble Rouser',
		type: 'talent',
		'system.description': 'You know how to rile up a crowd or get a posse angry.',
		'system.basicAction': 'You do not suffer from the penalty to PERFORMIN’ when trying to influence a crowd that outnumbers you.',
		'system.advAction':
			'Manipulation of the masses is mere child’s play. Upon a successful PERFORMIN’ test to influence a crowd you can incite anger or calm simply by speaking.',
		'system.reference': 'rabblerouser',
	},
	{
		name: 'Roper',
		type: 'talent',
		'system.description': 'You are skilled with the lasso.',
		'system.basicAction': 'You are an expert with the lasso and gain a +1 bonus to your ANIMAL HANDLIN’ roll when lassoing.',
		'system.advAction':
			'You can lasso from horseback without the −2 penalty for taking action on a moving horse. You can make a Called Shot when attempting to lasso a person.',
		'system.reference': 'roper',
	},
	{
		name: 'Sharp Shooter',
		type: 'talent',
		'system.description': 'You are an expert marksman.',
		'system.basicAction': 'You gain a +1 bonus when you use a rifle.',
		'system.advAction': 'You can use a rifle at Long range with no penalties, and at Distant range with only a −2 penalty.',
		'system.reference': 'sharpshooter',
	},
	{
		name: 'Shill',
		type: 'talent',
		'system.description': 'You are a friendly face in the crowd.',
		'system.basicAction':
			'When you act as a shill, helping someone to persuade, cheat, swindle, or scam, you give them a +2 bonus for your help, instead of the normal +1.',
		'system.advAction':
			'You are an expert shill, and can offer excellent assistance to another character. Your help gives them a bonus success for free when you are working together on a scam.',
		'system.reference': 'shill',
	},
	{
		name: 'Shotgun Master',
		type: 'talent',
		'system.description': 'You are unrivaled when it comes to using a shotgun, and always have one near to hand.',
		'system.basicAction':
			'As a free action you can use the butt of your shotgun to beat off an enemy at Arm’s Length. With a successful FIGHTIN’ roll, you push them to Near range.',
		'system.advAction':
			'You can fire both barrels of your double-barreled shotgun in one attack. If the attack hits, apply damage twice, using the number of successes for both attacks.',
		'system.reference': 'shotgunmaster',
	},
	{
		name: 'Smith',
		type: 'talent',
		'system.description': 'You know the art of hammering coarse iron into lethal blades, horseshoes and more. ',
		'system.basicAction': 'You can use the MAKIN’ ability to make and repair any metal tool or melee weapon with normal stats. ',
		'system.advAction':
			'You can make high-quality metal melee weapons. For each success after the first on your MAKIN’ test you can add a weapon quality of your choice. This can be used to add new qualities to existing weapons.',
		'system.reference': 'smith',
	},
	{
		name: 'Sneak',
		type: 'talent',
		'system.description': 'You are sneaky.',
		'system.basicAction': 'You gain a +1 bonus to any roll that relates to sneaking and hiding.',
		'system.advAction': 'When you make a sneak attack and do damage you automatically inflict a critical injury.',
		'system.reference': 'sneak',
	},
	{
		name: 'Survivor',
		type: 'talent',
		'system.description': 'You will survive.',
		'system.basicAction':
			'You are so rugged you can shake off damage from Shakes and Hurts. Each time you suffer damage, roll a number of dice equal to your Grit divided by 2 (round up)—the damage is reduced by 1 per success.',
		'system.advAction':
			'Once per session, when you are Broken by any kind of damage, you can immediately get back up, with all attributes restored by 1 point.',
		'system.reference': 'survivor',
	},
	{
		name: 'Swindler',
		type: 'talent',
		'system.description': 'You are a cheat and a swindler.',
		'system.basicAction': 'You gain a +1 bonus for any tests when scamming or cheating someone. This includes cheating while gambling.',
		'system.advAction':
			'If you fail a PERFORMIN’ roll while trying to scam someone you can immediately try again: reroll your PERFORMIN’ dice as a free action. ',
		'system.reference': 'swindler',
	},
	{
		name: 'The Voice',
		type: 'talent',
		'system.description': 'You have a beautiful singing voice or a way of speaking that gets people listening.',
		'system.basicAction':
			'You can use PERFORMIN’ to draw the attention of everyone within Short range. They stop what they are doing and listen to you for D6 Rounds. This does not apply during conflict, and may have a reduced effect on a rampaging rabble, at the GM’s discretion.',
		'system.advAction':
			'Your voice is so powerful and easy to listen to, you gain a +2 bonus on any PERFORMIN’ tests that relate to a performance of some kind (speech-making, singing, making a case in court, etc). ',
		'system.reference': 'thevoice',
	},
	{
		name: 'Tomahawk Fighter',
		type: 'talent',
		'system.description': 'Nothing splits a skull like a mighty axe.',
		'system.basicAction': 'You gain a +1 bonus to your attack rolls when you fight with an axe.',
		'system.advAction': 'When you hit an enemy with your axe and inflict 3 or more points of damage, you automatically inflict a critical injury. ',
		'system.reference': 'tomahawkfighter',
	},
	{
		name: 'Tracker',
		type: 'talent',
		'system.description': 'You know how to move, track, and hunt.',
		'system.basicAction': 'You are an expert tracker and gain a +1 bonus when tracking in the wilderness.',
		'system.advAction':
			'Time and distance mean nothing to you. Ignore the penalties for tracks disappearing over time unless the tracks are completely erased.',
		'system.reference': 'tracker',
	},
	{
		name: 'Two Gun',
		type: 'talent',
		'system.description': 'An expert with the iron, you can use one pistol in each hand.',
		'system.basicAction':
			'You can draw two pistols with one fast action and use your second pistol in your off hand to perform an extra Quick Shot attack per Round. This attack gets an extra −2 penalty on top of the −2 penalty for the Quick Shot itself (−4 in total). ',
		'system.advAction':
			'As for the Basic talent, but you do not get any penalty for the bonus Quick Shot (you still have the −2 modifier for the Quick Shot itself).',
		'system.reference': 'twogun',
	},
	{
		name: 'Warcry',
		type: 'talent',
		'system.description': 'Your voice is commanding and full of authority.',
		'system.basicAction':
			'Once per scene, and only in a fight or tense situation, you can make a call to arms that grants your comrades within Short range a +1 bonus to their next action.',
		'system.advAction':
			'Your warcry is so terrifying that once per scene, with a successful opposed PRESENCE vs INSIGHT test, you can force an opponent to spend their next action running from you. If the opponent is on horseback you may try to spook the horse instead—roll PRESENCE vs ANIMAL HANDLIN’. If successful the horse is spooked (see page XXX).',
		'system.reference': 'warcry',
	},
];

const created = await Item.createDocuments(data);

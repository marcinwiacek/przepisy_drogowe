//
//  AppDelegate.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "InneViewController.h"
#import "TaryfikatorViewController.h"
#import "TrescViewController.h"
#import "ZnakiViewController.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate> {
    InneViewController *controllerinne;
    TaryfikatorViewController *controllertaryfikator;
    TrescViewController *controllertresc;
    ZnakiViewController *controllerznaki;
    NSMutableArray *historiaURLOpisyZnakow,*historiaTopOpisyZnakow,*level0OpisyZnakow;
    NSString *opisyznakowSearch;
    BOOL znakimanypages;
    NSMutableArray *mojTaryfikatorRozdzial;
    long mojTaryfikatorSearchNum;
    id jsonObjects;
    IBOutlet UITabBarController *myTabBar;
}

-(NSString *)readNewTaryfikator2 :(NSString *)toSearch2 :(Boolean)InsideZnakiInne;

@property (strong, nonatomic) UIWindow *window;
@property (nonatomic, assign) InneViewController *controllerinne;
@property (nonatomic, assign) TaryfikatorViewController *controllertaryfikator;
@property (nonatomic, assign) TrescViewController *controllertresc;
@property (nonatomic, assign) ZnakiViewController *controllerznaki;
@property (nonatomic, strong) NSMutableArray *historiaURLOpisyZnakow;
@property (nonatomic, strong) NSMutableArray *historiaTopOpisyZnakow;
@property (nonatomic, strong) NSMutableArray *level0OpisyZnakow;
@property (nonatomic, strong) NSString *opisyznakowSearch;
@property (nonatomic, strong) NSMutableArray *mojTaryfikatorRozdzial;
@property (nonatomic, assign) long mojTaryfikatorSearchNum;
@property (nonatomic, strong) id jsonObjects;
@property (nonatomic, assign) BOOL znakimanypages;

@end

//
//  ZnakiChangeViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ZnakiChangeViewController : UIViewController {
    NSArray *menuArray, *menuArray2, *menuArrayiPad;
    IBOutlet UINavigationBar *znakiChangeNavigationBar;
    IBOutlet UITableView *znakiChangeTableView;
    IBOutlet UILabel *znakiChangeLabel;
    long nr;
    BOOL ZnakiZ2003,Szczegoly;
}

-(IBAction)znakiChangeButtonClicked:(id)sender;
-(IBAction)znakiExitButtonClicked:(id)sender;

@property (nonatomic,retain) NSArray *menuArray;
@property (nonatomic,retain) NSArray *menuArray2;
@property (nonatomic,retain) NSArray *menuArrayiPad;
@property(nonatomic,retain) IBOutlet UINavigationBar *znakiChangeNavigationBar;
@property(nonatomic,retain) IBOutlet UITableView *znakiChangeTableView;
@property(nonatomic,retain) IBOutlet UILabel *znakiChangeLabel;
@property(nonatomic,assign) long nr;
@property(nonatomic,assign) BOOL ZnakiZ2003;
@property(nonatomic,assign) BOOL Szczegoly;

@end

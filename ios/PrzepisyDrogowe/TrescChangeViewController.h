//
//  TrescChangeViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/8/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface TrescChangeViewController : UIViewController {
    NSArray *menuArray, *menuArray2, *menuArray3, *menuArrayiPad;
    IBOutlet UINavigationBar *trescChangeNavigationBar;
    IBOutlet UITableView *trescChangeTableView;
    IBOutlet UILabel *trescChangeLabel;
    long nr_akt,nr_rozdzial;
}

-(IBAction)trescExitButtonClicked:(id)sender;
-(IBAction)trescChangeButtonClicked:(id)sender;

@property (nonatomic,retain) NSArray *menuArray;
@property (nonatomic,retain) NSArray *menuArray2;
@property (nonatomic,retain) NSArray *menuArray3;
@property (nonatomic,retain) NSArray *menuArrayiPad;
@property(nonatomic,retain) IBOutlet UINavigationBar *trescChangeNavigationBar;
@property(nonatomic,retain) IBOutlet UITableView *trescChangeTableView;
@property(nonatomic,retain) IBOutlet UILabel *trescChangeLabel;
@property(nonatomic,assign) long nr_akt;
@property(nonatomic,assign) long nr_rozdzial;

@end

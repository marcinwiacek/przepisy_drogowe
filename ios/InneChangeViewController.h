//
//  InneChangeViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/7/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface InneChangeViewController : UIViewController {
    NSArray *menuArray;
    IBOutlet UINavigationBar *inneChangeNavigationBar;
    IBOutlet UITableView *inneChangeTableView;
    IBOutlet UILabel *inneChangeLabel;
    long nr;
}

-(IBAction)inneExitButtonClicked:(id)sender;
-(IBAction)inneChangeButtonClicked:(id)sender;

@property (nonatomic,retain) NSArray *menuArray;
@property(nonatomic,retain) IBOutlet UINavigationBar *inneChangeNavigationBar;
@property(nonatomic,retain) IBOutlet UITableView *inneChangeTableView;
@property(nonatomic,retain) IBOutlet UILabel *inneChangeLabel;
@property(nonatomic,assign) long nr;

@end

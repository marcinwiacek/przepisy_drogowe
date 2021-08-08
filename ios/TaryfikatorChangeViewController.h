//
//  TaryfikatorChangeViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/8/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TaryfikatorChangeViewController : UIViewController {
    NSArray *menuArray;
    IBOutlet UINavigationBar *taryfikatorChangeNavigationBar;
    IBOutlet UITableView *taryfikatorChangeTableView;
    IBOutlet UILabel *taryfikatorChangeLabel;
    long nr_akt,nr_rozdzial;
}

@property (nonatomic,retain) NSArray *menuArray;
@property(nonatomic,retain) IBOutlet UINavigationBar *taryfikatorChangeNavigationBar;
@property(nonatomic,retain) IBOutlet UITableView *taryfikatorChangeTableView;
@property(nonatomic,retain) IBOutlet UILabel *taryfikatorChangeLabel;
@property(nonatomic,assign) long nr_akt;
@property(nonatomic,assign) long nr_rozdzial;

@end

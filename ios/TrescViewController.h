//
//  TrescViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TrescViewController : UIViewController {
    IBOutlet UIWebView *trescWebView;
    IBOutlet UISearchBar *trescSearchBar;
    IBOutlet UINavigationBar *trescNavigationBar;
    long nr_akt, nr_rozdzial,old_akt,searchall,searchcurr,nr_op;
    IBOutlet UILabel *trescLabel;
    UIActivityIndicatorView *spinner;
    IBOutlet UIBarButtonItem *trescLeftButton;
    IBOutlet UIBarButtonItem *trescRightButton;
    IBOutlet UIBarButtonItem *trescChangeButton;
}

- (void)display;
- (void)searchBarSearchButtonClicked:(UISearchBar *)trescSearchBar;
- (BOOL)searchBarShouldEndEditing:(UISearchBar *)trescSearchBar;
- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)trescSearchBar;
- (void)webViewDidFinishLoad:(UIWebView *)trescWebView;
- (IBAction)trescLeftButtonMenuClicked:(id)sender;
- (IBAction)trescRightButtonMenuClicked:(id)sender;

@property(nonatomic,retain) IBOutlet UIWebView *trescWebView;
@property (nonatomic, retain) IBOutlet UISearchBar *trescSearchBar;
@property(nonatomic,retain) IBOutlet UINavigationBar *trescNavigationBar;
@property(nonatomic,assign) long nr_akt;
@property(nonatomic,assign) long nr_rozdzial;
@property(nonatomic,retain) IBOutlet UILabel *trescLabel;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *trescLeftButton;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *trescRightButton;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *trescChangeButton;

@end

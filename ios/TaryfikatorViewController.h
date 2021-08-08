//
//  TaryfikatorViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TaryfikatorViewController : UIViewController {
    IBOutlet UIWebView *taryfikatorWebView;
    IBOutlet UINavigationBar *taryfikatorNavigationBar;
    IBOutlet UISearchBar *taryfikatorSearchBar;
    long nr_akt,nr_rozdzial,old_akt,searchcurr,searchall;
    IBOutlet UILabel *taryfikatorLabel;
    UIActivityIndicatorView *spinner;
    IBOutlet UIBarButtonItem *taryfikatorLeftButton;
    IBOutlet UIBarButtonItem *taryfikatorRightButton;
    IBOutlet UIBarButtonItem *taryfikatorChangeButton;
}

- (void)display;
- (BOOL)webView:(UIWebView*)taryfikatorWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType;
- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)taryfikatorSearchBar;
- (void)searchBarSearchButtonClicked:(UISearchBar *)taryfikatorSearchBar;
- (BOOL)searchBarShouldEndEditing:(UISearchBar *)taryfikatorSearchBar;
- (NSString *)readOldTaryfikator:(NSString *)fname :(NSString *)toSearch;
- (void)webViewDidFinishLoad:(UIWebView *)taryfikatorWebView;
- (IBAction)taryfikatorLeftButtonMenuClicked:(id)sender;
- (IBAction)taryfikatorRightButtonMenuClicked:(id)sender;


@property(nonatomic,retain) IBOutlet UIWebView *taryfikatorWebView;
@property(nonatomic,retain) IBOutlet UINavigationBar *taryfikatorNavigationBar;
@property(nonatomic,retain) IBOutlet UISearchBar *taryfikatorSearchBar;
@property(nonatomic,assign) long nr_akt;
@property(nonatomic,assign) long nr_rozdzial;
@property(nonatomic,retain) IBOutlet UILabel *taryfikatorLabel;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *taryfikatorLeftButton;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *taryfikatorRightButton;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *taryfikatorChangeButton;

@end

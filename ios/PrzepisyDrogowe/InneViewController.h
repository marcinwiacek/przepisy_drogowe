//
//  InneViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/2/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface InneViewController : UIViewController<WKNavigationDelegate> {
    IBOutlet WKWebView *inneWebView;
    IBOutlet UINavigationBar *inneNavigationBar;
    IBOutlet UISearchBar *inneSearchBar;
    long nr,searchcurr,searchall;
    IBOutlet UILabel *inneLabel;
    UIActivityIndicatorView *spinner;
    IBOutlet UIBarButtonItem *inneLeftButton;
    IBOutlet UIBarButtonItem *inneRightButton;
    IBOutlet UIBarButtonItem *inneChangeButton;
}

- (void)display;
- (void)searchBarSearchButtonClicked:(UISearchBar *)inneSearchBar;
- (BOOL)searchBarShouldEndEditing:(UISearchBar *)inneSearchBar;
- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)inneSearchBar;
- (void)webView:(WKWebView *)inneWebView
decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
- (void)webView:(WKWebView *)inneWebView didFinishNavigation:(WKNavigation *)navigation;
- (IBAction)inneLeftButtonMenuClicked:(id)sender;
- (IBAction)inneRightButtonMenuClicked:(id)sender;
-(void)OrientationDidChange:(NSNotification*)notification;

@property(nonatomic,retain) IBOutlet WKWebView *inneWebView;
@property(nonatomic,retain) IBOutlet UINavigationBar *inneNavigationBar;
@property(nonatomic,retain) IBOutlet UISearchBar *inneSearchBar;
@property(nonatomic,retain) IBOutlet UILabel *inneLabel;
@property(nonatomic,assign) long nr;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *inneLeftButton;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *inneRightButton;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *inneChangeButton;

@end

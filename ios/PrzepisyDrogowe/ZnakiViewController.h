//
//  ZnakiViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/3/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface ZnakiViewController : UIViewController<WKNavigationDelegate> {
    IBOutlet WKWebView *znakiWebView;
    IBOutlet UISearchBar *znakiSearchBar;
    IBOutlet UINavigationBar *znakiNavigationBar;
    long nr;
    IBOutlet UILabel *znakiLabel;
    UIActivityIndicatorView *spinner;
    IBOutlet UIBarButtonItem *znakiChangeButton;
}

- (BOOL)searchBarShouldBeginEditing:(UISearchBar *)znakiSearchBar ;
- (void)searchBarSearchButtonClicked:(UISearchBar *)znakiSearchBar;
- (BOOL)searchBarShouldEndEditing:(UISearchBar *)znakiSearchBar;
- (void)display;
- (void)webView:(WKWebView *)znakiWebView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
- (void)webView:(WKWebView *)znakiWebView didFinishNavigation:(WKNavigation *)navigation;

@property(nonatomic,retain) IBOutlet WKWebView *znakiWebView;
@property(nonatomic,retain) IBOutlet UISearchBar *znakiSearchBar;
@property(nonatomic,retain) IBOutlet UINavigationBar *znakiNavigationBar;
@property(nonatomic,assign) long nr;
@property(nonatomic,retain) IBOutlet UILabel *znakiLabel;
@property(nonatomic,assign) BOOL ZnakiZ2003;
@property(nonatomic,assign) BOOL Szczegoly;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *znakiChangeButton;

@end

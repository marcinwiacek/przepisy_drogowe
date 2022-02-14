//
//  OpisZnakuViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/5/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface OpisZnakuViewController : UIViewController<WKUIDelegate, WKNavigationDelegate> {
    IBOutlet WKWebView *opisZnakuWebViewOne;
    IBOutlet WKWebView *opisZnakuWebViewTwo;
    IBOutlet WKWebView *opisZnakuWebViewThree;
    IBOutlet UINavigationBar *opisZnakuNavigationBar;
    IBOutlet UILabel *opisZnakuLabel;
    UIActivityIndicatorView *spinner;
    IBOutlet UIPageControl *opisZnakuPageControl;
    IBOutlet UIScrollView *opisZnakuScrollView;
    long toppos,CurIndex;
    NSMutableArray *znakiarraytytuly;
}

-(IBAction)OpisZnakuMenuClicked:(id)sender;
-(IBAction)OpisZnakuBackClicked:(id)sender;
- (void)display :(NSString*)tosearch :(WKWebView*)wv :(NSString*)znak :(NSInteger)level0Pos;
- (void)webView:(WKWebView *)opisZnakuWebViewTwo decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler;
- (void)webView:(WKWebView *)opisZnakuWebViewTwo didFinishNavigation:(WKNavigation *)navigation;

@property(nonatomic,retain) IBOutlet WKWebView *opisZnakuWebViewOne;
@property(nonatomic,retain) IBOutlet WKWebView *opisZnakuWebViewTwo;
@property(nonatomic,retain) IBOutlet WKWebView *opisZnakuWebViewThree;
@property(nonatomic,retain) IBOutlet UILabel *opisZnakuLabel;
@property(nonatomic,retain) IBOutlet UINavigationBar *opisZnakuNavigationBar;
@property(nonatomic,retain) IBOutlet UIPageControl *opisZnakuPageControl;
@property(nonatomic,retain) IBOutlet UIScrollView *opisZnakuScrollView;
@property (nonatomic, strong) NSMutableArray *znakiarraytytuly;

@end

//
//  OpisZnakuViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/5/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface OpisZnakuViewController : UIViewController<UIWebViewDelegate> {
    IBOutlet UIWebView *opisZnakuWebViewOne;
    IBOutlet UIWebView *opisZnakuWebViewTwo;
    IBOutlet UIWebView *opisZnakuWebViewThree;
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
- (void)display :(NSString*)tosearch :(UIWebView*)wv :(NSString*)znak :(NSInteger)level0Pos;
- (BOOL)webView:(UIWebView*)opisZnakuWebViewTwo shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType;
-(void)webViewDidFinishLoad:(UIWebView *)opisZnakuWebView;

@property(nonatomic,retain) IBOutlet UIWebView *opisZnakuWebViewOne;
@property(nonatomic,retain) IBOutlet UIWebView *opisZnakuWebViewTwo;
@property(nonatomic,retain) IBOutlet UIWebView *opisZnakuWebViewThree;
@property(nonatomic,retain) IBOutlet UILabel *opisZnakuLabel;
@property(nonatomic,retain) IBOutlet UINavigationBar *opisZnakuNavigationBar;
@property(nonatomic,retain) IBOutlet UIPageControl *opisZnakuPageControl;
@property(nonatomic,retain) IBOutlet UIScrollView *opisZnakuScrollView;
@property (nonatomic, strong) NSMutableArray *znakiarraytytuly;

@end

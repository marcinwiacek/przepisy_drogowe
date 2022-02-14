//
//  InneChangeViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/7/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "InneChangeViewController.h"
#import "AppDelegate.h"
#import "InneViewController.h"

@interface InneChangeViewController ()

@end

@implementation InneChangeViewController

@synthesize menuArray = _menuArray;
@synthesize nr = nr;
@synthesize inneChangeLabel = inneChangeLabel;
@synthesize inneChangeTableView = inneChangeTableView;
@synthesize inneChangeNavigationBar = inneChangeNavigationBar;

-(IBAction)inneChangeButtonClicked:(id)sender {
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    if (nr!=appDelegate.controllerinne.nr) {
        [appDelegate.controllerinne.inneLabel setText:[self.menuArray objectAtIndex:nr]];
        appDelegate.controllerinne.nr = nr;
        
        [self dismissViewControllerAnimated:YES completion: nil];
        
        [appDelegate.controllerinne display];
    } else {
        [self dismissViewControllerAnimated:YES completion: nil];
    }
}

-(IBAction)inneExitButtonClicked:(id)sender {
    [self dismissViewControllerAnimated:YES completion: nil];
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
  //  self.edgesForExtendedLayout=UIRectEdgeNone;
   //    [self prefersStatusBarHidden];
    
    self.menuArray = [[NSArray alloc]
                      initWithObjects:
                      @"Alarmowe",
                      @"Alkohol (informacje)",
                      @"Alkohol (kalkulator)",
                      @"Kierowanie ruchem",
                      @"Klimatyzacja (informacje)",
                      @"Oleje silnikowe",
                      @"Opony",
                      @"Prawo jazdy (kody ograniczeń)",
                      @"Prędkość (informacje)",
                      @"Prędkość (kalkulator)",
                      @"Prędkość (pomiary)",
                      @"Towary niebezpieczne (kody UN)",
                      @"Towary niebezpieczne (numery zagrożenia)",
                      @"Towary niebezpieczne (oznaczenia)",
                      @"Ważne informacje online",
                      @"Wyposażenie rowerów", nil];
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    nr = appDelegate.controllerinne.nr;
    
    [self.inneChangeTableView selectRowAtIndexPath:[NSIndexPath indexPathForRow:nr inSection:0] animated:NO scrollPosition:UITableViewScrollPositionTop ];
    [self.inneChangeTableView deselectRowAtIndexPath:[NSIndexPath indexPathForRow:nr inSection:0] animated:NO];
    
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    inneChangeLabel = [[UILabel alloc] initWithFrame:frame];
    inneChangeLabel.backgroundColor = [UIColor clearColor];
    inneChangeLabel.font = [UIFont boldSystemFontOfSize:14.0];
    inneChangeLabel.numberOfLines = 2;
    inneChangeLabel.textAlignment = NSTextAlignmentCenter;
    inneChangeLabel.textColor = [UIColor blackColor];
    inneChangeLabel.text = @"Zakładka \"Inne\"";
    
    self.inneChangeNavigationBar.topItem.titleView = inneChangeLabel;
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    return 16;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        
    }
    
    NSString *cellValue = [self.menuArray objectAtIndex:indexPath.row];
    cell.textLabel.text = cellValue;
    if (nr==indexPath.row) {
        cell.accessoryType = UITableViewCellAccessoryCheckmark;
    } else {
        cell.accessoryType = UITableViewCellAccessoryNone;
    }
    cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
    cell.textLabel.numberOfLines=0;
    
    return cell;
}



-(void) viewWillAppear:(BOOL)animated{
    
}

#pragma mark - Table view delegate

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    NSString *title = @"Pokazywany rozdział";
    return title;
};

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSIndexPath *oldpath = [NSIndexPath indexPathForRow:nr inSection:0];
    [[self.inneChangeTableView cellForRowAtIndexPath:oldpath] setAccessoryType:UITableViewCellAccessoryNone];
    
    nr=indexPath.row;
    [[self.inneChangeTableView cellForRowAtIndexPath:indexPath] setAccessoryType:UITableViewCellAccessoryCheckmark];
    [self.inneChangeTableView deselectRowAtIndexPath:indexPath animated:YES];
}

@end

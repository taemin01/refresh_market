package com.a3c1.refreshMkt.dto;

import com.a3c1.refreshMkt.entity.Bookmark;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookmarkResponse {
    private Integer bookmarkId;
    private Integer productId;
    private String productName;
    private Boolean status;
    private Integer price;
    private String image;

    public BookmarkResponse(Bookmark bookmark) {
        this.bookmarkId = bookmark.getBookmark_id();
        this.productId = bookmark.getProduct().getProduct_id();
        this.productName = bookmark.getProduct().getTitle();
        this.status = bookmark.getStatus();
        this.price = bookmark.getProduct().getPrice();
        this.image = bookmark.getProduct().getImage();
    }
}

